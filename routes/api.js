// routes/api.js
const express = require('express');
const router = express.Router();
const { getSpeechToText } = require('../services/speechService');
const { getAssistantResponse } = require('../services/nlpService');
const { getTextToSpeech } = require('../services/textToSpeech');

let conversationHistory = [];

router.post('/processAudio', async (req, res) => {
    const { audioBuffer } = req.body;
    const context = req.body.context || "Default context";
    
    try {
        const userMessage = await getSpeechToText(audioBuffer);
        conversationHistory.push({ role: 'user', content: userMessage });
        
        const assistantResponse = await getAssistantResponse(userMessage, conversationHistory, context);
        conversationHistory.push({ role: 'assistant', content: assistantResponse });
        
        const audioResponse = await getTextToSpeech(assistantResponse);
        res.json({ audioResponse });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing audio');
    }
});

module.exports = router;
