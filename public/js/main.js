const socket = io();
const Recorder = require("recorder-js");
// Create the audio context and the recorder instance
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let recorder = new Recorder(audioContext, {
    onAnalysed: data => {
        // Optionally handle analysis data
        console.log('Analysing audio data:', data);
    }
});

// Monitor silence (threshold in dB)
let silenceThreshold = -30;
let silenceTimeout;
const silenceDuration = 2000; // 2 seconds
let isRecording = false;

document.addEventListener('DOMContentLoaded', () => {
    const voiceButton = document.getElementById('voice-button');

    if (!voiceButton) {
        console.error('Voice button not found');
        return;
    }

    voiceButton.addEventListener('click', () => {
        console.log('Voice button clicked');

        // Start the audio context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed');
            });
        }

        // Access the microphone
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                recorder.init(stream);
                startRecording();
            })
            .catch(error => {
                console.error('Error accessing the microphone', error);
            });
    });
});

// Start recording
function startRecording() {
    recorder.start()
        .then(() => {
            console.log('Recording started');
            isRecording = true;
            monitorSilence();
        })
        .catch(error => {
            console.error('Failed to start recording:', error);
        });
}

// Stop recording and handle the data
function stopRecording() {
    recorder.stop()
        .then(({ blob }) => {
            console.log('Recording stopped, processing data...');
            const reader = new FileReader();

            reader.onloadend = () => {
                const audioBuffer = reader.result;
                console.log('Audio buffer size:', audioBuffer.byteLength);

                // Send audioBuffer to server via WebSocket
                socket.emit('audioMessage', audioBuffer);
                console.log('Audio buffer sent to server:', audioBuffer);
            };

            reader.readAsArrayBuffer(blob); // Convert blob to ArrayBuffer
        })
        .catch(error => {
            console.error('Failed to stop recording:', error);
        });
}

// Monitor for silence and auto-stop recording
function monitorSilence() {
    recorder.analyse()
        .then(data => {
            const average = data.reduce((sum, value) => sum + value, 0) / data.length;
            const decibels = 20 * Math.log10(average / 255);

            if (decibels < silenceThreshold && isRecording) {
                if (!silenceTimeout) {
                    silenceTimeout = setTimeout(() => {
                        stopRecording();
                        silenceTimeout = null;
                    }, silenceDuration);
                }
            } else {
                clearTimeout(silenceTimeout);
                silenceTimeout = null;
            }

            if (isRecording) {
                requestAnimationFrame(monitorSilence); // Continue monitoring
            }
        });
}

// Listen for bot's audio response from the server
socket.on('botMessage', (audioBase64) => {
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.play();
    appendMessage(`Agent: [Audio Response]`);
});

// Append messages to the chat window
function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    document.getElementById('messages').appendChild(messageElement);
}
