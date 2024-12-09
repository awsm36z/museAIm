const { ElevenLabsClient } = require("elevenlabs");

const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_API_KEY });
const voiceIDs = { mark: "UgBBYS2sOqTuMpoF3BR0", jessica: "g6xIsTj2HwM6VR4iXFCw" };

async function streamTextToSpeech(text, socket) {
    try {
        // Split text into chunks if it's too long
        const MAX_CHARS = 5000; // ElevenLabs' approximate limit
        const textChunks = text.match(new RegExp(`.{1,${MAX_CHARS}}`, 'g'));

        for (const chunk of textChunks) {
            console.log(`Sending chunk to ElevenLabs: ${chunk.length} characters`);

            const stream = await client.textToSpeech.convertAsStream(voiceIDs.mark, {
                text: chunk,
                model_id: "eleven_multilingual_v2", // Adjust model if needed
            });

            // Stream audio data to the client
            stream.on('data', (chunk) => {
                socket.emit('ttsChunk', chunk.toString('base64'));
            });

            stream.on('end', () => {
                console.log('Finished streaming audio chunk');
                socket.emit('ttsEnd');
            });

            stream.on('error', (err) => {
                console.error('Error during ElevenLabs TTS Streaming:', err);
                socket.emit('ttsError', err.message || 'Error during text-to-speech');
            });
        }
    } catch (error) {
        console.error("Error during ElevenLabs Text-to-Speech Streaming:", error);
        throw error;
    }
}

module.exports = { streamTextToSpeech };
