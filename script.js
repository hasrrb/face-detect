console.log("Script file successfully loaded!");

const video = document.getElementById('webcam');
const statusBtn = document.getElementById('status-btn');

// 1. Camera access ki koshish karein
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      console.log("Camera access granted!");
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("Camera Access Denied or Error:", err);
      statusBtn.innerText = "Camera Access Denied";
    });
} else {
  console.error("Browser does not support camera!");
  statusBtn.innerText = "Camera Not Supported";
}

// 2. Model Load Karein
let model;
console.log("Loading AI Model...");

cocoSsd.load().then((loadedModel) => {
  console.log("Model successfully loaded!");
  model = loadedModel;
  statusBtn.innerText = "No Person Detected";
  detectFrame();
}).catch((err) => {
  console.error("Model loading failed:", err);
  statusBtn.innerText = "Model Load Failed";
});

// 3. Person Detection Loop
function detectFrame() {
  if (!model) return;
  
  model.detect(video).then((predictions) => {
    const personFound = predictions.some((prediction) => prediction.class === 'person');

    if (personFound) {
      statusBtn.innerText = "Person Detected";
      statusBtn.className = "green-btn";
    } else {
      statusBtn.innerText = "No Person Detected";
      statusBtn.className = "red-btn";
    }

    requestAnimationFrame(detectFrame);
  });
}