const video = document.getElementById('webcam');
const statusBtn = document.getElementById('status-btn');

let model;

// 1. TensorFlow AI Model load karein
console.log("Loading AI Model...");
cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
  console.log("Model Loaded Successfully!");
  
  // Model load hone ke baad camera shuru karein
  startCamera();
}).catch(err => {
  console.error("Model Loading Error: ", err);
});

// 2. Camera Start Karein
function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        
        // Jab video play hona shuru ho tabhi detection start karein
        video.onloadeddata = () => {
          console.log("Video Feed Active. Starting Detection Loop...");
          detectFrame();
        };
      })
      .catch((err) => {
        console.error("Camera Error: ", err);
        statusBtn.innerText = "Camera Blocked";
      });
  }
}

// 3. Continuous Detection Loop
function detectFrame() {
  // Check karein ke video chal rahi hai aur model ready hai
  if (model && video.readyState === 4) {
    model.detect(video).then((predictions) => {
      
      // Console par predictions print karein taake pta chale AI ko kya mil raha hai
      console.log("Detections: ", predictions);

      // Check karein kya koi 'person' detect hua hai (Confidence > 50%)
      const personFound = predictions.some(
        (prediction) => prediction.class === 'person' && prediction.score > 0.5
      );

      if (personFound) {
        statusBtn.innerText = "Person Detected";
        statusBtn.className = "green-btn";
      } else {
        statusBtn.innerText = "No Person Detected";
        statusBtn.className = "red-btn";
      }

      // Next frame ke liye loop repeat karein
      requestAnimationFrame(detectFrame);
    }).catch(err => {
      console.error("Detection Error: ", err);
      requestAnimationFrame(detectFrame);
    });
  } else {
    // Video ready hone ka wait karein
    requestAnimationFrame(detectFrame);
  }
}
