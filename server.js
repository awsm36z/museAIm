const axios = require('axios')
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

    socket.on('audioMessage', async (audioBuffer) => {
        console.log('Received audio buffer from client:', audioBuffer);

        try {
            const response = await axios.post('http://localhost:3000/api/processAudio', { audioBuffer });
            console.log('Audio processing response:', response.data);
            const { audioResponse } = response.data;
            socket.emit('botMessage', audioResponse);
        } catch (error) {
            console.error('Error processing audio:', error.response ? error.response.data : error.message);
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
