const axios = require('axios')
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const { getSpeechToText } = require('./services/speechService');


// Increase the body size limit
app.use(bodyParser.json({ limit: '50mb' })); // You can adjust '50mb' based on your needs
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
        console.log('\n\n RECIEVED AUDIO MESSAGE AS AUDIOARRAYBUFFER\n\n')
        try {
            const audioBuffer = Buffer.from(new Uint8Array(audioArrayBuffer));  // Ensure it's properly converted to Buffer
            console.log('\n\nReceived audio buffer, size:', audioBuffer.length, '\n\n');
            
            const transcription = await getSpeechToText(audioBuffer);  // Process the audio
            socket.emit('botMessage', transcription);  // Send transcription back
        } catch (error) {
            console.error('Error processing audio:', error);
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
