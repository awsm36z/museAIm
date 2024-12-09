const axios = require('axios');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const { getSpeechToText } = require('./services/speechService');
const { getAssistantResponse } = require('./services/nlpService');
const { streamTextToSpeech } = require('./services/textToSpeech');

let messageHistory = [];

// Increase the body size limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const apiRoutes = require('./routes/api');

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Use API Routes
app.use('/api', apiRoutes);

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('audioMessage', async (audioArrayBuffer) => {
        try {
            const audioBuffer = Buffer.from(new Uint8Array(audioArrayBuffer));
            console.log('\n\nReceived audio buffer, size:', audioBuffer.length, '\n\n');

            // Convert speech to text
            const transcription = await getSpeechToText(audioBuffer);
            console.log('Transcription:', transcription);
            socket.emit('botMessage', transcription);

            // Add transcription to message history
            messageHistory.push({ role: "user", content: transcription });

            // Process the transcription with NLP
            const nlpResponse = await getAssistantResponse(
                transcription,
                messageHistory,
                "currently located at the dinosaurs exhibit surrounded by dinosaurs from different eras."
            );
            console.log('NLP Response:', nlpResponse);

            // Stream Text-to-Speech audio
            //const stream = await streamTextToSpeech(nlpResponse);

            // stream.on('data', (chunk) => {
            //     console.log('Streaming TTS chunk...');
            //     socket.emit('ttsChunk', chunk.toString('base64')); // Send each chunk as base64
            // });

            // stream.on('end', () => {
            //     console.log('TTS streaming complete');
            //     socket.emit('ttsEnd'); // Notify the client that streaming is done
            // });


            await streamTextToSpeech(nlpResponse, socket);
            console.log('TTS audio streamed back to client.');
            
            // stream.on('error', (error) => {
            //     console.error('Error during TTS streaming:', error.message || error);
            //     socket.emit('ttsError', 'Error during TTS streaming');
            // });

        } catch (error) {
            console.error('Error processing audio:', error);
            socket.emit('error', 'An error occurred while processing the audio.');
        }
    });
});

module.exports = server; // To use it in electronMain.js
