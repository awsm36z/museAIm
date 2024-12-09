const { ipcRenderer } = require('electron');
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
console.log('THREE.js imported:', THREE);

let scene, camera, renderer, dinosaur, audioContext, audioAnalyser, dataArray;

// Initialize Three.js and load the dinosaur model
function init3DModel() {
    const container = document.getElementById('character-container');

    // Set up Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(ambientLight, directionalLight);

    // Load the dinosaur model
    const loader = new GLTFLoader();
    loader.load('./models/scene.gltf', (gltf) => {
        dinosaur = gltf.scene;
        dinosaur.rotation.y = Math.PI;
        scene.add(dinosaur);
        animate();
    });    

    camera.position.z = 5;
}

// Animate the dinosaur character
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // Lip-sync animation
    if (audioAnalyser && dinosaur) {
        audioAnalyser.getByteFrequencyData(dataArray);
        const amplitude = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const mouth = dinosaur.getObjectByName('Mouth');
        if (mouth) mouth.rotation.x = amplitude * 0.01;
    }
}

// Handle recording and processing audio
async function recordAndProcessAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioPath = URL.createObjectURL(audioBlob);

        // Send the audio to the main process
        const { transcription, audioPath: responseAudioPath } = await ipcRenderer.invoke('process-audio', audioPath);

        // Play the audio response
        const audio = new Audio(responseAudioPath);
        audio.play();

        // Update the dinosaur's animation based on the transcription
        displayEmotion(transcription);
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
}

// Display emotion based on text
function displayEmotion(text) {
    const emotion = text.includes('happy') ? 'happy' : 'neutral';
    const arms = dinosaur.getObjectByName('Arms');
    const head = dinosaur.getObjectByName('Head');
    if (emotion === 'happy') {
        if (arms) arms.rotation.x = Math.sin(Date.now() * 0.005) * 0.5;
        if (head) head.rotation.y = Math.sin(Date.now() * 0.005) * 0.3;
    } else {
        if (head) head.rotation.y = 0;
    }
}

// Initialize everything
document.getElementById('start-button').addEventListener('click', recordAndProcessAudio);
init3DModel();
