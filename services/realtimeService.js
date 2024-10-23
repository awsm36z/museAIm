const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// WebSocket connection to OpenAI Realtime API
const openaiSocketUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
let ws;

function connectToOpenAI() {
    ws = new WebSocket(openaiSocketUrl, {
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "OpenAI-Beta": "realtime=v1",
        }
    });

    ws.on('open', () => {
        console.log('Connected to OpenAI Realtime API');

        // Send the initial instructions to OpenAI
        const generalInstructions = fs.readFileSync('public/general.txt', 'utf8');
        const dinosaurInstructions = fs.readFileSync('public/instructions.txt', 'utf8');

        const initialMessage = {
            type: 'response.create',
            response: {
                modalities: ['text', 'audio'],  // Request both text and audio response
                instructions: generalInstructions + dinosaurInstructions,
            }
        };

        ws.send(JSON.stringify(initialMessage));
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log('Received from OpenAI:', message);

        // When we receive audio or text from OpenAI, send it back to the client
        if (message.type === 'response.audio') {
            io.emit('botMessage', message.audio);
        }
    });

    ws.on('close', () => {
        console.log('OpenAI connection closed. Reconnecting...');
        setTimeout(connectToOpenAI, 1000);
    });

    ws.on('error', (error) => {
        console.error('OpenAI connection error:', error);
    });
}

// Connect to OpenAI when the server starts
connectToOpenAI();

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // When we receive audio from the frontend, send it to OpenAI
    socket.on('audioMessage', (audioBuffer) => {
        console.log('Received audio from client');

        const audioEvent = {
            type: 'conversation.item.create',
            item: {
                type: 'input_audio',
                audio: audioBuffer.toString('base64') // Convert to base64
            }
        };

        ws.send(JSON.stringify(audioEvent));  // Send audio to OpenAI Realtime API
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});