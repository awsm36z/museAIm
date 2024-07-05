require('dotenv').config();
const { SpeechClient } = require('@google-cloud/speech');

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const textToSpeechClient = new TextToSpeechClient();
const speechClient = new SpeechClient();

app.use(express.static('public'));

let conversationHistory = [];

const context = "You are now located in the dinosaur exhibit Context of the Exhibit, located in Building 1, and leads down to the space exhibit down the ramp to the Agent display’s right, the guest’s left. The agent display is on the main path leading down to the ramp to the space exhibit. At the bottom of the ramp, to the right, is the Williard smith planetarium, often just called “the planetarium”, and can be hard to find for some as it is relatively tucked out of the way There are 4 main sections. Directly behind the guest (In the context of facing the Agent display), there is a pair of deinonychus sitting ontop of a dead dinosaur, emphasizing their focus on hunting together to bring down big prey, on top of a grassy terrain platform. Below the terrain, we see a glass view of some eggs being “incubated”. In front of the guest, (behind the agent display) there is an Allosaurus. The allosaurus is on a circular platform with some synthetic shrubs. Surrounding the platform is a small little path following a “u” shape, with other platforms and dinosaurs on them. Starting on the right side entrance of the path (right with respect to guest, left with respect to agent display) we see a pachycephalosaurus and then a triceratops. Making our way down the path, we then see a parasaurolophus. As we make our way to the deepest part of the path, as in the bottom of the “u”l, we see some big dinosaur footprints. Now as we turn the path and start making our way back towards the main path, with the allosaurus now to the guest’s LEFT, to their right, is another platform, with a stegasaurus, and then just before the ramp and main path, an apatosaurus, surrounded by synthetic shrubbery to symbolise its omnivore behavior. Now when we get back and face the agent display once more, behind the guest to the right, up high above, is a glorious t-rex. the guest is a 12 year old boy";

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        conversationHistory = [];  // Reset conversation history on disconnect
    });

    socket.on('audioMessage', async (audioBuffer) => {
        const message = await getSpeechToText(audioBuffer);
        conversationHistory.push({ role: 'user', content: message });
        const nlpResponse = await getAssistantResponse(message, context);
        const audioResponse = await getTextToSpeech(nlpResponse);
        socket.emit('botMessage', audioResponse);
    });

    socket.on('userMessage', async (message, context) => {
        conversationHistory.push({ role: 'user', content: message });
        const nlpResponse = await getAssistantResponse(message, context);
        const audioResponse = await getTextToSpeech(nlpResponse);
        socket.emit('botMessage', audioResponse);
    });
});

async function getSpeechToText(audioBuffer) {
    const audio = {
        content: audioBuffer.toString('base64'),
    };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
    };
    const request = {
        audio: audio,
        config: config,
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    return transcription;
}


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
