const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const statusBtn = document.getElementById('status-btn');

let model;
let audioCtx = null;
let oscillator = null;
let isContinuousBeeping = false;
let previousState = null; // 'DETECTED' ya 'NOT_DETECTED' track karne ke liye

// 1. Audio Engine Setup
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Single 1-Second Beep (Jab banda camera ke samne aaye)
function playSingleBeep() {
  stopContinuousBeep(); // Pehle se chalne wale alarm ko rokein
  initAudio();
  
  try {
    const singleOsc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    singleOsc.type = 'sine';
    singleOsc.frequency.setValueAtTime(600, audioCtx.currentTime); // Normal notification pitch
    
    singleOsc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    singleOsc.start();
    // Exactly 1 second (1000ms) baad stop kar dein
    singleOsc.stop(audioCtx.currentTime + 1.0);
  } catch (e) {
    console.error("Audio error:", e);
  }
}

// Continuous Alarm Beep (Jab banda camera ke samne na ho)
function startContinuousBeep() {
  if (isContinuousBeeping) return;
  initAudio();
  
  try {
    oscillator = audioCtx.createOscillator();
    oscillator.type = 'sawtooth'; // High warning alert sound
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    isContinuousBeeping = true;
  } catch (e) {
    console.error("Audio error:", e);
  }
}

function stopContinuousBeep() {
  if (!isContinuousBeeping || !oscillator) return;
  oscillator.stop();
  oscillator.disconnect();
  isContinuousBeeping = false;
}

// 2. Camera Setup
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

// 3. High-Accuracy Face Detection & Tracking Loop
async function detectFaces() {
  if (!model) return;

  const predictions = await model.estimateFaces(video, false);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (predictions.length > 0) {
    // ---- PERSON DETECTED ----
    statusBtn.innerText = "Person Detected";
    statusBtn.className = "green-btn";

    // Agar banda pehle nahi tha aur abhi aaya hai
    if (previousState !== 'DETECTED') {
      stopContinuousBeep();
      playSingleBeep(); // Sirf 1 second ki beep
      previousState = 'DETECTED';
    }

    // Green Bounding Box Box Draw Karein
    predictions.forEach((prediction) => {
      const start = prediction.topLeft;
      const end = prediction.bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];

      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;
      ctx.strokeRect(start[0], start[1], size[0], size[1]);

      ctx.fillStyle = "#00FF00";
      ctx.fillRect(start[0], start[1] - 25, 120, 25);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 14px Arial";
      ctx.fillText("TRACKING", start[0] + 8, start[1] - 7);
    });

  } else {
    // ---- NO PERSON DETECTED ----
    statusBtn.innerText = "No Person Detected";
    statusBtn.className = "red-btn";

    // Agar banda camera se hat gaya hai
    if (previousState !== 'NOT_DETECTED') {
      startContinuousBeep(); // Tab tak bajegi jab tak banda wapas na aaye
      previousState = 'NOT_DETECTED';
    }
  }

  requestAnimationFrame(detectFaces);
}

// 4. Initialize Application
async function init() {
  try {
    statusBtn.innerText = "Loading AI Engine...";
    model = await blazeface.load();

    statusBtn.innerText = "Starting Camera...";
    await setupCamera();
    video.play();

    statusBtn.innerText = "No Person Detected";
    detectFaces();
  } catch (error) {
    statusBtn.innerText = "Error Loading System";
    console.error("Init Error:", error);
  }
}

init();
