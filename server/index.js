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


const usedb=process.env.USEDB;

// Mock database (in-memory)
const users = [];
const questions = require('./question.json');

// Register route
app.post('/register', async (req, response) => {
  const { name, email, institution, mobile, ...edata } = req.body;
  try{
  if(usedb){
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
  }else{
    response.status(201).json({ message: "Registered successfully", user: { name, email, institution, mobile, ...edata} ,id: 1});
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

  if(usedb){
    await db.collection('users').doc(id).collection(`${id}_logs`).add({
      UserID: id,
      score,
      answerStatus
    });
  }
  // Send both the score and answer status back to the client
  res.json({ score, answersubmitted });
});


// Express endpoint to log events
app.post('/log', async (req, res) => {
  try {
    const logData = req.body;
    //console.log(logData['UserID']);
    // console.log(JSON.stringify(logData));
    if(usedb){
      id=logData['UserID'];


      if (!logData || typeof logData !== 'object') {
        return res.status(400).send('Invalid log data');
      }

      //   
      await db.collection('users').doc(id).collection(`${id}_logs`).add({
        ...logData, // Spread the entire body into the Firestore document
      });
    }
    

    res.status(200).send('Event logged successfully in Firestore');
  } catch (error) {
    console.error('Error logging event to Firestore', error);
    res.status(500).send('Error logging event');
  }
});

let notr = 0;
let arr = [0,1,2,3,4,5,6,7,8,9,10,11];
const imageLog=[];
const randomSize = Math.floor(Math.random() * (11)) + 5;
function getRandomSubset(arr, min, max) {
  // Shuffle the array using Fisher-Yates Shuffle
  for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Determine a random size between min and max
  const randomSize = Math.floor(Math.random() * (max - min + 1)) + min;
  return arr.slice(0, randomSize);
}

const session = require("express-session");
const { time } = require('console');
// app.use(session({
//   secret: "xy1",    // Used to sign the session ID cookie
//   resave: false,                // Prevents resaving session if nothing changes
//   saveUninitialized: true,      // Forces a session to be saved even if unmodified
//   cookie: { secure: false }     // Set to true if using HTTPS
// }));

app.post("/receive-image", async (req, res) => {
  const { frame,id,num } = req.body;
  

  // if (!frame) {
  //   return res.status(400).send("No frame received");
  // }
  if(usedb){
    
    try {
        // const flaskResponse = await axios.post("http://localhost:8000/process", req.body, {
        //   headers: { "Content-Type": "application/json" }
        // });
  
      // //  const fau=flaskResponse.data;
      // nd=getRandomSubset(arr, 5, 11);
      // mapping_BP4D = {0:'Inner Brow Raiser',1:'Outer Brow Raiser',2:'Brow Lowerer',
      //   3:'Cheek raiser',4:'Lid Tightener',
      //   5:'Upper Lip Raiser',6:'Lip Corner Puller',
      //   7:'Dimpler',8:'Lip Corner Depressor',9:'Chin Raiser',
      //   10:'Lip Tightener',11:'Lip pressor'}

      // fau=nd.map((x)=>mapping_BP4D[x]);
      logfau({ num, id ,timestamp: new Date().toISOString()});
      }catch (error) {
      console.error("Error forwarding to Flask:", error.message);
      return res.status(500).send("Error forwarding to Flask");
    }
  
    res.status(200).json({ message: "Frame processed successfully" });
  }else{
    res.status(200).json({
      message: "Frame processed successfully",
    });
  }
  
});

app.post("/receive-expression", async (req, res) => {
  const {maxEmotion,id,ts} = req.body;

  // if (!expressions) {
  //   return res.status(400).send("No frame received");
  // }
  if(usedb){
    try {
      
      logexpression(req.body);
  
      // Send the Flask server's response back to the React frontend
      res.status(200).json({
        message: "Frame processed successfully",
        
      });
    } catch (error) {
      console.error("Error forwarding to Flask:", error.message);
      res.status(500).send("Error forwarding to Flask");
    }
  }else{
    //console.log(req.body);
    res.status(200).json({
      message: "Frame processed successfully",
    });
  }
  
});



function logfau(data){
  const {fau,id,ts}=data;
  // console.log(data);
  const httpTransportOptions = {
    host: 'http-intake.logs.us5.datadoghq.com',
    path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nodejs&service=FAU&ddtags=id:${id}`,
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
  logger.info(data,{type: 'FAU' ,id:id});
}

function logexpression(data){
  const {maxEmotion,id,ts}=data
  const httpTransportOptions = {
    host: 'http-intake.logs.us5.datadoghq.com',
    path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nodejs&service=expression&ddtags=id:${id}`,
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
  logger.info(data,{type: 'EXPRESSION',id:id });

}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));