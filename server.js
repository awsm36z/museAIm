const axios = require('axios');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const { getSpeechToText } = require('./services/speechService'); // Import the speech-to-text function
const { getAssistantResponse } = require('./services/nlpService');


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
        // console.log('\n\nRECIEVED AUDIO MESSAGE AS AUDIOARRAYBUFFER\n\n');
        try {

            const audioBuffer = Buffer.from(new Uint8Array(audioArrayBuffer));
            console.log('\n\nReceived audio buffer, size:', audioBuffer.length, '\n\n');
            
            const transcription = await getSpeechToText(audioBuffer);
            socket.emit('botMessage', transcription);
            //messageHistory.push({"user":transcription})
            // console.log('Transcription:', transcription);
            

            const nlpResponse = await getAssistantResponse(transcription, [], "currently located at the dinosaurs exbibit surrounded by dinosaurs from different eras.");
            console.log('NLP Response:', nlpResponse);

            
        } catch (error) {
            console.error('Error processing audio:', error);
        }
    });
});

module.exports = server; // To use it in electronMain.js
