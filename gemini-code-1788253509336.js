const video = document.getElementById('webcam');
const statusBtn = document.getElementById('status-btn');

// Webcam setup
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Camera access error:", err);
  });

// Model load aur detection
let model;
cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
  detectFrame();
});

function detectFrame() {
  model.detect(video).then((predictions) => {
    // Check karein kya koi 'person' detect hua hai
    const personFound = predictions.some((prediction) => prediction.class === 'person');

    if (personFound) {
      statusBtn.innerText = "Person Detected";
      statusBtn.className = "green-btn";
    } else {
      statusBtn.innerText = "No Person Detected";
      statusBtn.className = "red-btn";
    }

    // Har frame par check karne ke liye repeat karein
    requestAnimationFrame(detectFrame);
  });
}