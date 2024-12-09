const axios = require("axios");
require("dotenv").config();

const ELEVENLABS_API_KEY = process.env.ELEVEN_LABS_API_KEY; // Your ElevenLabs API key
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Replace with your desired voice ID

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const VOICE_IDS = {
    mark: "UgBBYS2sOqTuMpoF3BR0",
    jessica: "g6xIsTj2HwM6VR4iXFCw",
    default: DEFAULT_VOICE_ID, // Fallback voice
};

async function getTextToSpeech(text) {
    try {
        // Make a POST request to ElevenLabs TTS API
        const response = await axios.post(
            `${ELEVENLABS_API_URL}/${VOICE_IDS.mark}`,
            {
                text, // The text to convert to speech
                model_id: "eleven_multilingual_v2", // Default TTS model
            },
            {
                headers: {
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer", // Receive the audio as a binary buffer
            }
        );

        console.log("TTS audio successfully generated using ElevenLabs.");
        return Buffer.from(response.data).toString("base64"); // Convert audio to base64
    } catch (error) {
        console.error("Error generating speech with ElevenLabs:", error.response?.data || error.message);
        throw error;
    }
}

module.exports = { getTextToSpeech };
