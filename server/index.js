const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require("axios");

const path = require('path');

const { createLogger, format, transports } = require('winston');



// const logger = createLogger({
//   level: 'info',
//   exitOnError: false,
//   format: format.json(),
//   transports: [
//     new transports.Http(httpTransportOptions),
//   ],
// });

// module.exports = logger;

require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

// Mock database (in-memory)
const users = [];
const questions = [
  { id: 1, question: "What is 2 + 2?", options: ["3", "4", "5"], answer: 1 },
  { id: 2, question: "What is the capital of France?", options: ["Berlin", "Paris", "Madrid"], answer: 1 },
  { id: 3, question: "What is the capital of Germany?", options: ["Berlin", "Paris", "Madrid"], answer: 0},
  { id: 4, question: "What is the capital of Spain?", options: ["Berlin", "Paris", "Madrid"], answer: 2 },
  { id: 5, question: "What is x+y?", options: ["0","1","2"], answer: 1 },
  { id: 6, question: "What is x+ey?", options: ["0","1e","2"], answer: 2 }
    // Add more questions as needed
];

// Register route
app.post('/register', async (req, response) => {
  const { name, email, institution, mobile, ...edata } = req.body;
  try{
  
  let querySnapshot1={};
  if(institution === 'IIITD'){
    querySnapshot1 = await db.collection('creation')
      .where('RollNo', '==', edata['rollNo'])
      .get();
  }else{
    querySnapshot1 = await db.collection('creation')
      .where('RefID', '==', edata['refID'])
      .get();
  }

  if (querySnapshot1.empty) {
    response.status(400).json({ message: "ERROR", error : "Given RefID/RollNo is not valid . Contact Administrator" });
    
  }else{
    await db.collection('users').add({
      name,
      email,
      institution,
      edata // Spread the entire body into the Firestore document
    });
    const querySnapshot2 = await db.collection('users')
      .where('name', '==', name)
      .get();
  
  const docIds = [];
  querySnapshot2.forEach(doc => {
    docIds.push(doc.id);
  });
  const id = docIds[0];
  response.status(201).json({ message: "Registered successfully", user: { name, email, institution, mobile, ...edata} ,id: id});
  }

  
}catch (error) {
  console.error('Error during registration:', err);
  response.status(500).json({ 
    message: "ERROR", 
    error: "An internal server error occurred . Try Again in a While" 
  });
}

});

// Get questions route
app.get('/questions', (req, res) => {
  res.json(questions);
});

app.post('/getscore', async (req, res) => {
  //console.log(req.body['answer']);
  const answers = req.body['answer']; // Assuming 'answer' is an array from the frontend
  const id = req.body['id'];
  let score = 0;
  let answerStatus = []; // This array will store the status for each answer
  let answersubmitted =[];
  questions.forEach((question, index) => {
    if (answers[index] === -1) {
      // If no answer is submitted for this question
      answerStatus.push("not submitted");
      answersubmitted.push("not submitted");
    } else if (question.answer === answers[index]) {
      // If the answer is correct
      score += 1;
      answerStatus.push("correct");
      answersubmitted.push("submitted");
    } else {
      // If the answer is incorrect
      answerStatus.push("incorrect");
      answersubmitted.push("submitted");
    }
  });
  await db.collection(`${id}_logs`).add({
    UserID: id,
    score,
    answerStatus
  });

  // Send both the score and answer status back to the client
  res.json({ score, answersubmitted });
});


// Express endpoint to log events
app.post('/log', async (req, res) => {
  try {
    const logData = req.body;
    //console.log(logData['UserID']);
    // console.log(JSON.stringify(logData));

    id=logData['UserID'];


    if (!logData || typeof logData !== 'object') {
      return res.status(400).send('Invalid log data');
    }

    //   
    await db.collection(`${id}_logs`).add({
      ...logData, // Spread the entire body into the Firestore document
    });

    res.status(200).send('Event logged successfully in Firestore');
  } catch (error) {
    console.error('Error logging event to Firestore', error);
    res.status(500).send('Error logging event');
  }
});


app.post("/receive-image", async (req, res) => {
  const { frame } = req.body;

  if (!frame) {
    return res.status(400).send("No frame received");
  }

  try {
    // Forward the frame to the Flask server
    const flaskResponse = await axios.post("http://localhost:8000/process", { frame });
    
    // Log the response from Flask
    console.log("Response from Flask:", flaskResponse.data);
    logfau(flaskResponse.data);

    // Send the Flask server's response back to the React frontend
    res.status(200).json({
      message: "Frame processed successfully",
      flaskResponse: flaskResponse.data,
    });
  } catch (error) {
    console.error("Error forwarding to Flask:", error.message);
    res.status(500).send("Error forwarding to Flask");
  }
});

app.post("/receive-gazer", async (req, res) => {
    const {data,time} =req.body;
    loggazer(req.body);
    res.status(200).json({
      message: "gazer processed successfully",
    });
});

function logfau(data){
  


  const httpTransportOptions = {
    host: 'http-intake.logs.us5.datadoghq.com',
    path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nodejs&service=FAU&ddtags=env:dev`,
    ssl: true
  };

  const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format: format.json(),
    transports: [
      new transports.Http(httpTransportOptions),
    ],
  });

  module.exports = logger;
  logger.info(data,{type: 'FAU' });
}

function loggazer(data){
 

  const httpTransportOptions = {
    host: 'http-intake.logs.us5.datadoghq.com',
    path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nodejs&service=gazer&ddtags=env:dev`,
    ssl: true
  };

  const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format: format.json(),
    transports: [
      new transports.Http(httpTransportOptions),
    ],
  });

  module.exports = logger;
  logger.info(data,{type: 'GAZER' });
}

// const storage = multer.diskStorage({
//   destination:"./uploads",
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}__${file.originalname}`); // Appends timestamp to original file name
//   },
// });

// const upload = multer({ 
//   storage: storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
// }).single('image'); // Expecting a single file with field name 'image'

// app.post('/upload', (req, res) => {
//   upload(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//       return res.status(400).send({ message: 'File too large!' });
//       console.log("not file uploaded successfully");
//     } else if (err) {
//       return res.status(500).send({ message: 'Failed to upload file!' });
//       console.log("not file uploaded successfully");
//     }
//     res.status(200).send({ message: 'Upload successful!', file: req.file });
//     console.log("file uploaded successfully")
//   });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));