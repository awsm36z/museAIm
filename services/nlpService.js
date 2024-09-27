// services/nlpService.js
const axios = require('axios');

async function getAssistantResponse(userMessage, conversationHistory, context) {
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
    return botMessage;
}

module.exports = { getAssistantResponse };
