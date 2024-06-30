require('dotenv').config();
console.log('Google Application Credentials:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const textToSpeechClient = new TextToSpeechClient();

app.use(express.static('public'));

let conversationHistory = [];

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        conversationHistory = [];  // Reset conversation history on disconnect
    });

    socket.on('userMessage', async (message, context) => {
        conversationHistory.push({ role: 'user', content: message });
        const nlpResponse = await getAssistantResponse(message, context);
        const audioResponse = await getTextToSpeech(nlpResponse);
        socket.emit('botMessage', audioResponse);
    });
});

async function getAssistantResponse(userMessage, context) {
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await axios.post(`https://api.openai.com/v1/chat/completions`, {
        model: 'gpt-4',
        messages: [
            { role: 'system', content: `You are an exhibit-specific museum guide...` },
            { role: 'user', content: `Context: ${context}` },
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ],
        max_tokens: 150
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    const botMessage = response.data.choices[0].message.content.trim();
    conversationHistory.push({ role: 'assistant', content: botMessage });
    return botMessage;
}

async function getTextToSpeech(text) {
    const [response] = await textToSpeechClient.synthesizeSpeech({
        input: { text: text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    });
    return response.audioContent.toString('base64');
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
