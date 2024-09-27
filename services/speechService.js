// services/speechService.js
const { SpeechClient } = require('@google-cloud/speech');
const speechClient = new SpeechClient();

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

module.exports = { getSpeechToText };
