const video = document.getElementById('webcam');
const statusBtn = document.getElementById('status-btn');

let model;

// 1. Setup Camera
async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false
    });
    video.srcObject = stream;
    
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  } catch (error) {
    statusBtn.innerText = "Camera Access Denied";
    console.error("Camera Error:", error);
  }
}

// 2. Detection Loop
async function detectPerson() {
  if (!model) return;

  // Detect objects in the video frame
  const predictions = await model.detect(video);
  
  // Look for 'person' class in predictions
  let personDetected = false;

  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i].class === 'person') {
      personDetected = true;
      break;
    }
  }

  // Update UI
  if (personDetected) {
    statusBtn.innerText = "Person Detected";
    statusBtn.className = "green-btn";
  } else {
    statusBtn.innerText = "No Person Detected";
    statusBtn.className = "red-btn";
  }

  // Run continuous loop
  requestAnimationFrame(detectPerson);
}

// 3. Initialize App
async function init() {
  statusBtn.innerText = "Loading AI Model...";
  
  // Load fixed version COCO-SSD Model
  model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
  
  statusBtn.innerText = "Starting Camera...";
  await setupCamera();
  
  video.play();
  statusBtn.innerText = "No Person Detected";
  
  // Start Detection
  detectPerson();
}

// Run code when page loads
init();
