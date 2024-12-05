// Function to create an AudioContext and analyser
function createAudioContext() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048; // Configure FFT size for finer frequency detail
  return { audioContext, analyser };
}

// Function to play audio and capture data
function playAudioAndAnimate(audioBuffer, audioContext, analyser) {
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
      animateAvatarBasedOnAudio(analyser);
  });
}

// Function to animate based on the audio data
const leftEye = document.querySelector('.left-eye');
const rightEye = document.querySelector('.right-eye');
const mouth = document.querySelector('.robot-mouth');

function animateAvatarBasedOnAudio(analyser) {
  // Check if analyser is defined
  if (!analyser) {
      console.error("Analyser is not defined. Make sure it's initialized.");
      return;
  }

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function animateFrame() {
      analyser.getByteFrequencyData(dataArray);

      const eyeMovement = dataArray[0] / 5;
      const mouthWidth = dataArray[0] / 2;

      leftEye.style.transform = `translateY(${eyeMovement}px)`;
      rightEye.style.transform = `translateY(${eyeMovement}px)`;
      mouth.style.width = `${70 + mouthWidth}px`;

      requestAnimationFrame(animateFrame);
  }

  animateFrame(); // Start the recursive animation loop
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
  // Assuming there's an audio input simulation button (e.g., for testing purposes)
  const simulateAudioButton = document.getElementById('simulate-audio-button');
  if (simulateAudioButton) {
      simulateAudioButton.addEventListener('click', () => {
          const { audioContext, analyser } = createAudioContext();
          simulateAudioInput('/audio/sample.wav', audioContext, analyser);
      });
  }
});

// Function to simulate audio input and animate avatar based on audio
function simulateAudioInput(filePath, audioContext, analyser) {
  fetch(filePath)
      .then(response => response.arrayBuffer())
      .then(data => {
          playAudioAndAnimate(data, audioContext, analyser);
      })
      .catch(error => console.error('Error loading audio file:', error));
}
