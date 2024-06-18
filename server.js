require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('userMessage', async (message) => {
        const response = await getChatGptResponse(message);
        socket.emit('botMessage', response);
    });
});

async function getChatGptResponse(userMessage) {
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: userMessage }
        ],
        max_tokens: 150
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });
    return response.data.choices[0].message.content.trim();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
