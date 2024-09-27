// services/textToSpeech.js
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const textToSpeechClient = new TextToSpeechClient();

async function getTextToSpeech(text) {
    const [response] = await textToSpeechClient.synthesizeSpeech({
        input: { text: text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    });
    return response.audioContent.toString('base64');
}

module.exports = { getTextToSpeech };
