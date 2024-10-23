const socket = io();

// Capture audio using MediaRecorder API with silence detection
let mediaRecorder;
let audioChunks = [];
let audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Global
let analyser = audioContext.createAnalyser(); // Global
let dataArray;
let silenceThreshold = -30; // Threshold in dB
let silenceTimeout;
const silenceDuration = 2000; // 2 seconds

document.addEventListener('DOMContentLoaded', () => {
    const voiceButton = document.getElementById('voice-button');

    if (!voiceButton) {
        console.error('Voice button not found');
        return;
    }

    voiceButton.addEventListener('click', () => {
        console.log('Voice button clicked');

        // Check if the AudioContext is suspended and resume it
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed');
            });
        }
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                const source = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser(); // Ensure analyser is connected to the stream
                source.connect(analyser);
                analyser.fftSize = 256;

                const bufferLength = analyser.frequencyBinCount;  // Ensure bufferLength is set correctly
                dataArray = new Uint8Array(bufferLength); // Initialize dataArray with analyser's frequencyBinCount size

                // Setup MediaRecorder event handlers
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];  // Clear the chunks array
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const audioBuffer = reader.result;

                        // Send audioBuffer to server via WebSocket
                        socket.emit('audioMessage', audioBuffer);
                        console.log('Audio buffer sent to server:', audioBuffer);
                    };
                    reader.readAsArrayBuffer(audioBlob);
                };

                // Start recording
                mediaRecorder.start();
                monitorSilence();
            })
            .catch(error => {
                console.error('Error accessing the microphone', error);
            });
    });

    voiceButton.addEventListener('mouseup', () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            console.log('Recording stopped');
        }
    });
});

// Monitor for silence and auto-stop recording
function monitorSilence() {
    analyser.getByteFrequencyData(dataArray);  // Use analyser from the global scope
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const decibels = 20 * Math.log10(average / 255);

    if (decibels < silenceThreshold) {
        if (!silenceTimeout) {
            silenceTimeout = setTimeout(() => {
                if (mediaRecorder && mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                    console.log('Recording stopped due to silence');
                }
                silenceTimeout = null;
            }, silenceDuration);
        }
    } else {
        clearTimeout(silenceTimeout);
        silenceTimeout = null;
    }

    requestAnimationFrame(monitorSilence);
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
