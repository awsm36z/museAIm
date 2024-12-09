const socket = io('http://localhost:3000');
const ipcRenderer = window.electronAPI;


// Create the audio context
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let mediaRecorder;
let audioChunks = [];

// Monitor silence (threshold in dB)
let silenceThreshold = -30; // Adjust based on your needs
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
        if (!isRecording) {
            console.log('Voice button clicked, starting recording...');
            startRecording();
            isRecording = true;
            voiceButton.textContent = '🛑 Stop';
        } else {
            console.log('Stopping recording...');
            stopRecording();
            isRecording = false;
            voiceButton.textContent = '🎤 Speak';
        }
    });
});

// Start recording
function startRecording() {
    // Access the microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                console.log('Recording stopped, processing data...');
                const audioBlob = new Blob(audioChunks);
                audioChunks = [];
                
                const reader = new FileReader();

                reader.onloadend = () => {
                    const audioBuffer = reader.result;
                    console.log('Audio buffer size:', audioBuffer.byteLength);

                    // Send audioBuffer to server via WebSocket
                    socket.emit('audioMessage', audioBuffer);
                    console.log('Audio buffer sent to server:', audioBuffer);

                    // Send the Blob to Electron's main process to save it locally
                    // ipcRenderer.sendToMain('save-audio-file', {
                    //     buffer: audioBuffer,
                    //     type: 'audio/ogg',
                    // });
                };

                reader.readAsArrayBuffer(audioBlob); // Convert blob to ArrayBuffer
            };

            mediaRecorder.start();
            console.log('Recording started');
            isRecording = true;
            monitorSilence(stream); // Start monitoring silence
        })
        .catch(error => {
            console.error('Error accessing the microphone', error);
        });
}

// Stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log('Recording stopped');
        isRecording = false;
    }
}

// Monitor for silence and auto-stop recording
function monitorSilence(stream) {
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function checkForSilence() {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const decibels = 20 * Math.log10(average / 255);

        if (decibels < silenceThreshold && isRecording) {
            if (!silenceTimeout) {
                silenceTimeout = setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                        console.log('Recording stopped due to silence');
                        isRecording = false;
                    }
                    silenceTimeout = null;
                }, silenceDuration);
            }
        } else {
            clearTimeout(silenceTimeout);
            silenceTimeout = null;
        }

        if (isRecording) {
            requestAnimationFrame(checkForSilence);
        }
    }

    requestAnimationFrame(checkForSilence);
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