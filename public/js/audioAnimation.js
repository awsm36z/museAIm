// Create an AudioContext

let bufferLength = analyser.frequencyBinCount;

// Function to play audio and capture data
function playAudioAndAnimate(audioBuffer) {
    // Decode the audio data
    audioContext.decodeAudioData(audioBuffer, function(buffer) {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
  
      // Connect the audio source to the analyser and then to the destination (speakers)
      source.connect(analyser);
      analyser.connect(audioContext.destination);
  
      // Start playing the audio
      source.start(0);
  
      // Start the animation based on the audio
      animateBasedOnAudio();
    });
  }
// Function to animate based on the audio data
const leftEye = document.querySelector('.left-eye');
const rightEye = document.querySelector('.right-eye');
const mouth = document.querySelector('.robot-mouth');

function animateAvatarBasedOnAudio() {
    // Check if dataArray and analyser are defined
    if (!dataArray || !analyser) {
        console.error("dataArray or analyser is not defined. Make sure they're initialized.");
        return;
    }

    analyser.getByteFrequencyData(dataArray); // This uses the global `dataArray` and `analyser`

    const eyeMovement = dataArray[0] / 5;
    const mouthWidth = dataArray[0] / 2;

    leftEye.style.transform = `translateY(${eyeMovement}px)`;
    rightEye.style.transform = `translateY(${eyeMovement}px)`;
    mouth.style.width = `${70 + mouthWidth}px`;

    requestAnimationFrame(animateAvatarBasedOnAudio);
}

// Start animating
animateAvatarBasedOnAudio();


// Load and process the audio file for simulation

// document.getElementById('simulate-audio-button').addEventListener('click', () => {
//     simulateAudioInput('/audio/sample.wav');
// });

// const mouthElement = document.querySelector('.robot-mouth');

// function startTalkingAnimation() {
//     mouthElement.classList.add('talking');
// }

// function stopTalkingAnimation() {
//     mouthElement.classList.remove('talking');
// }

// // Call `startTalkingAnimation` when the voice starts, and `stopTalkingAnimation` when it's done.

// function simulateAudioInput(filePath) {
//     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
//     fetch(filePath)
//         .then(response => response.arrayBuffer())
//         .then(data => audioContext.decodeAudioData(data))
//         .then(buffer => {
//             const source = audioContext.createBufferSource();
//             source.buffer = buffer;

//             const analyser = audioContext.createAnalyser();
//             analyser.fftSize = 2048;

//             source.connect(analyser);
//             analyser.connect(audioContext.destination);
//             source.start(0);  // Play the audio file

//             const dataArray = new Uint8Array(analyser.frequencyBinCount);

//             function processSimulatedAudio() {
//                 analyser.getByteFrequencyData(dataArray);

//                 // Simulate the avatar animation based on the pre-recorded audio
//                 const eyeMovement = dataArray[0] / 5;
//                 const mouthWidth = dataArray[0] / 2;

//                 leftEye.style.transform = `translateY(${eyeMovement}px)`;
//                 rightEye.style.transform = `translateY(${eyeMovement}px)`;
//                 mouth.style.width = `${70 + mouthWidth}px`;

//                 if (source.playbackState === source.PLAYING_STATE) {
//                     requestAnimationFrame(processSimulatedAudio);
//                 }
//             }

//             processSimulatedAudio();
//         })
//         .catch(error => console.error('Error loading audio file:', error));
// }



