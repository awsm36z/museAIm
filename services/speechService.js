// services/speechService.js
const { SpeechClient } = require('@google-cloud/speech');

const speechClient = new SpeechClient({
    keyFilename: './private/museaimtest-04e5ffabdcf6.json'
});

async function getSpeechToText(audioBuffer) {

    console.log('Audio Buffer Type:', typeof audioBuffer);
    console.log('Audio Buffer Size:', audioBuffer.length);

    const audioContent = audioBuffer.toString('base64'); // Ensure correct base64 encoding
    const audio = {
        content: audioContent,
    };
    const config = {
        encoding: 'OGG_OPUS',  // The correct encoding
        sampleRateHertz: 48000,  // Set this to match the sample rate of the audio
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,  // Optional: Add punctuation to the transcription
        model: 'default',  // You can try setting a specific model for transcription, like 'video' or 'phone_call'
        profanityFilter: false,  // Disable profanity filter if it's sensitive to certain words
        useEnhanced: true,  // Enable enhanced models for better accuracy
    };
    const request = {
        audio: audio,
        config: config,
    };

    try {
        console.log('\n\ntrying to understand this gibberish!!!!\n\n')
        const [response] = await speechClient.recognize(request);
    
        // Log the entire response object in a readable format
        console.log(`\n\nWE GOT SOME KIND OF RESPONSE????\n${JSON.stringify(response, null, 2)}`); 
    
        if (!response.results || response.results.length === 0) {
            console.error('\n\nNO TRANSCRIPTION RESULTS FOUND\n\n');
            return '';
        }
    
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
    
        return transcription;
    } catch (error) {
        console.error('Error processing audio:', error);
        throw error;
    }
}

module.exports = { getSpeechToText };
