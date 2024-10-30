
import * as faceapi from 'face-api.js';
import React from 'react';

function TestQ() {

  const [modelsLoaded, setModelsLoaded] = React.useState(false);
  const [captureVideo, setCaptureVideo] = React.useState(false);

  const videoRef = React.useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = React.useRef();

  React.useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    }
    loadModels();
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  }

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }
    }, 100)
  }

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
  }

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '10px' }}>
        {
          captureVideo && modelsLoaded ?
            <button onClick={closeWebcam} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '10px', border: 'none', borderRadius: '10px' }}>
              Close Webcam
            </button>
            :
            <button onClick={startVideo} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '10px', border: 'none', borderRadius: '10px' }}>
              Open Webcam
            </button>
        }
      </div>
      {
        captureVideo ?
          modelsLoaded ?
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} style={{ borderRadius: '10px' }} />
                <canvas ref={canvasRef} style={{ position: 'absolute' }} />
              </div>
            </div>
            :
            <div>loading...</div>
          :
          <>
          </>
      }
    </div>
  );
}

export default TestQ;
// import { Helmet } from 'react-helmet';
// import React, { useEffect,useState } from 'react';
// // const socket = io.connect('http://127.0.0.1:5001');
// import * as faceapi from 'face-api.js';

// const TestQ = () => {
//   const [isChecked, setIsChecked] = useState(true);
  

//   // useEffect(() => {
//   //   startCamera();
//   //   loadModels();
//   // },[]);

//   // const loadModels = ()=>{
//   //   Promise.all([
//   //     // THIS FOR FACE DETECT AND LOAD FROM YOU PUBLIC/MODELS DIRECTORY
//   //     faceapi.nets.tinyFaceDetector.loadFromUri("/face-api.js/weights"),
//   //     faceapi.nets.faceLandmark68Net.loadFromUri("/face-api.js/weights"),
//   //     faceapi.nets.faceRecognitionNet.loadFromUri("/face-api.js/weights"),
//   //     faceapi.nets.faceExpressionNet.loadFromUri("/face-api.js/weights")

//   //     ]).then(()=>{
//   //       console.log("models loaded")
//   //   })
//   // }


//   // async function startCamera() {
//   //   const video = document.getElementById('video');
//   //   try {
//   //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//   //     video.srcObject = stream;
      
//   //   } catch (error) {
//   //     console.error("Error accessing camera: ", error);
//   //   }
//   // }

//   // async function runExpressionRecognition() {
//   //   const video = document.getElementById('video');
//   //   const canvas = faceapi.createCanvasFromMedia(video);
//   //   document.body.append(canvas);
//   //   const displaySize = { width: video.width, height: video.height };
//   //   faceapi.matchDimensions(canvas, displaySize);

//   //   setInterval(async () => {
//   //     const detections = await faceapi
//   //       .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//   //       .withFaceLandmarks()
//   //       .withFaceExpressions();
//   // //       console.log(detections);
//   // // socket.emit( 'my event', {
//   // //   data: detections
//   // // });

//   //     const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
//   //     canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      
//   //     // Draw face expressions on canvas
//   //     faceapi.draw.drawDetections(canvas, resizedDetections);
//   //     faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
//   //   }, 100); // Run detection every 100ms
//   // }

//   function captureScreenshot() {
//     const video = document.getElementById('video');
//     const canvas = document.createElement('canvas');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const context = canvas.getContext('2d');
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     return canvas;
// }

// function sendScreenshotToServer() {
//     const screenshot = captureScreenshot();
//     screenshot.toBlob(function(blob) {
//     const formData = new FormData();
//     formData.append('image', blob, 'screenshot.png');
//     try {
//         const response = fetch('http://localhost:5000/upload', {
//             method: 'POST',
//             body: formData
//         });
//         if (!response.ok) {
//             throw new Error('Failed to send screenshot');
//         }else{
//           console.log("screenshot sent successfully")
//         }
//     } catch (error) {
//         console.error("Error sending screenshot to server: ", error);
//     }}, 'image/png'); 
// }

// // function startScreenshotLoop(interval = 5000) {
// //     setInterval(sendScreenshotToServer, interval);
// // }

// useEffect(() => {
//   let intervalId;

//   if (!isChecked) {
//     // If checkbox is unchecked, start the interval to take a screenshot every 5 seconds
//     intervalId = setInterval(() => {
//       sendScreenshotToServer();
//     }, 5000);
//   }

//   // Clean up the interval when the component unmounts or when isChecked changes
//   return () => {
//     if (intervalId) {
//       clearInterval(intervalId);
//     }
//   };
// }, [isChecked]);

//   const handleCheckboxChange = (event) => {
//     setIsChecked(event.target.checked); // Update state with the new checked status
//   };

  



//   return (
//     <div>
//       {/* <Helmet>
//         <script type="text/javascript" src="flask-face-api/static/js/face-api.min.js"></script>
//         <script type="text/javascript" src="flask-face-api/static/js/index.js"></script>
//         <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
//       </Helmet> */}
//       <video id="video" autoPlay style={{ display: 'block', width: '20%' }}></video>
//       <canvas id="canvas" style={{ display: 'block', width: '20%' }}></canvas>
//       <label>
//         <input
//             type="checkbox"
//             checked={isChecked}  // Controlled by state
//             onChange={handleCheckboxChange}  // Update state on change
//           />disable screenshot
//       </label>
//     </div>
//   );
// };

// export default TestQ;