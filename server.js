// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

    socket.on('audioMessage', async (audioBuffer) => {
        try {
            const response = await axios.post('/api/processAudio', { audioBuffer });
            const { audioResponse } = response.data;
            socket.emit('botMessage', audioResponse);
        } catch (error) {
            console.error('Error processing audio:', error);
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
