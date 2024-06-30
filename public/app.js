const socket = io();

document.getElementById('send-button').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const message = input.value;
    input.value = '';
    if (message) {
        const context = "You are now located in the dinosaur exhibit Context of the Exhibit, located in Building 1, and leads down to the space exhibit down the ramp to the Agent display’s right, the guest’s left. The agent display is on the main path leading down to the ramp to the space exhibit. At the bottom of the ramp, to the right, is the Williard smith planetarium, often just called “the planetarium”, and can be hard to find for some as it is relatively tucked out of the way There are 4 main sections. Directly behind the guest (In the context of facing the Agent display), there is a pair of deinonychus sitting ontop of a dead dinosaur, emphasizing their focus on hunting together to bring down big prey, on top of a grassy terrain platform. Below the terrain, we see a glass view of some eggs being “incubated”. In front of the guest, (behind the agent display) there is an Allosaurus. The allosaurus is on a circular platform with some synthetic shrubs. Surrounding the platform is a small little path following a “u” shape, with other platforms and dinosaurs on them. Starting on the right side entrance of the path (right with respect to guest, left with respect to agent display) we see a pachycephalosaurus and then a triceratops. Making our way down the path, we then see a parasaurolophus. As we make our way to the deepest part of the path, as in the bottom of the “u”l, we see some big dinosaur footprints. Now as we turn the path and start making our way back towards the main path, with the allosaurus now to the guest’s LEFT, to their right, is another platform, with a stegasaurus, and then just before the ramp and main path, an apatosaurus, surrounded by synthetic shrubbery to symbolise its omnivore behavior. Now when we get back and face the agent display once more, behind the guest to the right, up high above, is a glorious t-rex. the guest is a 12 year old boy";
        appendMessage(`You: ${message}`);
        socket.emit('userMessage', message, context);
    }
});

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

// Voice recognition using Web Speech API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('message-input').value = transcript;
    document.getElementById('send-button').click();
};

document.getElementById('voice-button').addEventListener('click', () => {
    recognition.start();
});

function animateTalkingHead(audio) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = context.createAnalyser();
    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
        requestAnimationFrame(animate);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const scale = average / 128;

        // Update your talking head or bubble animation here
        const talkingHead = document.getElementById('talking-head');
        talkingHead.style.transform = `scaleY(${1 + scale * 0.5})`;
    }

    animate();
}
