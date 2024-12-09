const socket = io();


const context = "You are now located in the dinosaur exhibit Context of the Exhibit, located in Building 1, and leads down to the space exhibit down the ramp to the Agent display’s right, the guest’s left. The agent display is on the main path leading down to the ramp to the space exhibit. At the bottom of the ramp, to the right, is the Williard smith planetarium, often just called “the planetarium”, and can be hard to find for some as it is relatively tucked out of the way There are 4 main sections. Directly behind the guest (In the context of facing the Agent display), there is a pair of deinonychus sitting ontop of a dead dinosaur, emphasizing their focus on hunting together to bring down big prey, on top of a grassy terrain platform. Below the terrain, we see a glass view of some eggs being “incubated”. In front of the guest, (behind the agent display) there is an Allosaurus. The allosaurus is on a circular platform with some synthetic shrubs. Surrounding the platform is a small little path following a “u” shape, with other platforms and dinosaurs on them. Starting on the right side entrance of the path (right with respect to guest, left with respect to agent display) we see a pachycephalosaurus and then a triceratops. Making our way down the path, we then see a parasaurolophus. As we make our way to the deepest part of the path, as in the bottom of the “u”l, we see some big dinosaur footprints. Now as we turn the path and start making our way back towards the main path, with the allosaurus now to the guest’s LEFT, to their right, is another platform, with a stegasaurus, and then just before the ramp and main path, an apatosaurus, surrounded by synthetic shrubbery to symbolise its omnivore behavior. Now when we get back and face the agent display once more, behind the guest to the right, up high above, is a glorious t-rex. the guest is a 12 year old boy";


// document.getElementById('send-button').addEventListener('click', () => {
//     const input = document.getElementById('message-input');
//     const message = input.value;
//     input.value = '';
//     if (message) {
        
//         appendMessage(`You: ${message}`);
//         socket.emit('userMessage', message, context);
//     }

// });


socket.on('botMessage', (audioBase64) => {
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.play();
    appendMessage(`Agent: [Audio Response]`);
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    document.getElementById('messages').appendChild(messageElement);
}

// Audio capture using MediaRecorder API with silence detection
let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let dataArray;
let silenceThreshold = -30; // Threshold in dB
let silenceTimeout;
const silenceDuration = 2000; // 2 seconds

document.addEventListener('DOMContentLoaded', (event) => {
    const voiceButton = document.getElementById('voice-button');
    // Check if the button is correctly selected
    if (!voiceButton) {
        console.error('Voice button not found');
        return;
    }
    console.log("button exists")
});

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
            console.log('Data available: ', event.data); // Add this line to log audio data
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            console.log('Audio blob created: ', audioBlob); // Add this line to log audio blob
            audioChunks = [];  // Clear the chunks array
            const reader = new FileReader();
            reader.onloadend = () => {
                const audioBuffer = reader.result;
                console.log('Audio buffer ready to send: ', audioBuffer); // Add this line to log audio buffer
                socket.emit('audioMessage', audioBuffer);
            };
            reader.readAsArrayBuffer(audioBlob);
        };

        mediaRecorder.onstart = () => {
            console.log('Recording started'); // Add this line to log recording start
            monitorSilence();
        };

        document.getElementById('voice-button').addEventListener('mousedown', () => {
            mediaRecorder.start();
            console.log('Hold to Record button pressed');
        });

        document.getElementById('voice-button').addEventListener('mouseup', () => {
            mediaRecorder.stop();
            console.log('Hold to Record button released'); // Log button release
            console.log('Recording stopped by user'); // Add this line to log recording stop
        });
    })
    .catch(error => {
        console.error('Error accessing the microphone', error);
    });

function monitorSilence() {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const decibels = 20 * Math.log10(average / 255);

    //console.log('Decibels: ', decibels); // Add this line to log decibel levels

    if (decibels < silenceThreshold) {
        if (!silenceTimeout) {
            silenceTimeout = setTimeout(() => {
                mediaRecorder.stop();
                silenceTimeout = null;
                console.log('Recording stopped due to silence'); // Add this line to log silence stop
            }, silenceDuration);
        }
    } else {
        clearTimeout(silenceTimeout);
        silenceTimeout = null;
    }

    requestAnimationFrame(monitorSilence);
}


    // function animate() {
    //     requestAnimationFrame(animate);
    //     analyser.getByteFrequencyData(dataArray);
    //     const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    //     const scale = average / 128;

    //     // Update your talking head or bubble animation here
    //     const talkingHead = document.getElementById('talking-head');
    //     talkingHead.style.transform = `scaleY(${1 + scale * 0.5})`;
    // }

    // animate();