const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const statusBtn = document.getElementById('status-btn');

let model;
let audioCtx = null;
let oscillator = null;
let isBeeping = false;

// 1. Audio Beep Generator (Browser Built-in Audio Engine)
function startBeep() {
  if (isBeeping) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz Beep Sound
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    isBeeping = true;
  } catch (e) {
    console.error("Audio error:", e);
  }
}

function stopBeep() {
  if (!isBeeping || !oscillator) return;
  oscillator.stop();
  oscillator.disconnect();
  isBeeping = false;
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

  // BlazeFace Model se detection
  const predictions = await model.estimateFaces(video, false);

  // Clear previous frame overlay drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (predictions.length > 0) {
    // Person/Face Detected
    statusBtn.innerText = "Person Detected";
    statusBtn.className = "green-btn";
    
    // Play Alert Sound
    startBeep();

    // Draw Bounding Boxes for every face found
    predictions.forEach((prediction) => {
      const start = prediction.topLeft;
      const end = prediction.bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];

      // Green Bounding Box Box
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;
      ctx.strokeRect(start[0], start[1], size[0], size[1]);

      // Label Overlay Background
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(start[0], start[1] - 25, 120, 25);

      // Text Label
      ctx.fillStyle = "#000000";
      ctx.font = "bold 14px Arial";
      ctx.fillText("TRACKING", start[0] + 8, start[1] - 7);
    });

  } else {
    // No Face Detected
    statusBtn.innerText = "No Person Detected";
    statusBtn.className = "red-btn";
    
    // Stop Beep Sound
    stopBeep();
  }

  // Loop next frame
  requestAnimationFrame(detectFaces);
}

// 4. Initialize Tracker App
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
