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
app.use(bodyParser.json({ limit: "200mb" }));

const usedb=process.env.USEDB === 'true';

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


// app.post("/receive-image", async (req, res) => {
//   if(!usedb){
//     try {
//         axios.
//         post(`${process.env.FLASK_ADDRESS}/log`, {...req.body,service:"FAU"}, {
//           headers: { "Content-Type": "application/json" }
//         });
//       }catch (error) {
//       console.error("Error forwarding to Flask:", error.message);
//       return res.status(500).send("Error forwarding to Flask");
//     }
  
//     res.status(200).json({ message: "Frame processed successfully" });
//   }else{
//     res.status(200).json({
//       message: "Frame processed successfully",
//     });
//   }
  
// });

// app.post("/receive-expression", async (req, res) => {
//   if(!usedb){
//     try {
//         axios.
//         post(`${process.env.FLASK_ADDRESS}/log`, {...req.body,service:"expression"}, {
//           headers: { "Content-Type": "application/json" }
//         });
//       }catch (error) {
//       console.error("Error forwarding to Flask:", error.message);
//       return res.status(500).send("Error forwarding to Flask");
//     }
  
//     res.status(200).json({ message: "Frame processed successfully" });
//   }else{
//     res.status(200).json({
//       message: "Frame processed successfully",
//     });
//   }
  
  
// });



// function logfau(data){
//   const {fau,id,ts}=data;
//   // console.log(data);
//   const httpTransportOptions = {
//     host: 'http-intake.logs.us5.datadoghq.com',
//     path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nodejs&service=FAU&ddtags=id:${id}`,
//     ssl: true
//   };

//   const logger = createLogger({
//     level: 'info',
//     exitOnError: false,
//     format: format.json(),
//     transports: [
//       new transports.Http(httpTransportOptions),
//     ],
//   });

//   module.exports = logger;
//   logger.info(data,{type: 'FAU' ,id:id});
// }

// function logexpression(data){
//   const {maxEmotion,id,ts}=data
//   const httpTransportOptions = {
//     host: 'http-intake.logs.us5.datadoghq.com',
//     path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nodejs&service=expression&ddtags=id:${id}`,
//     ssl: true
//   };

//   const logger = createLogger({
//     level: 'info',
//     exitOnError: false,
//     format: format.json(),
//     transports: [
//       new transports.Http(httpTransportOptions),
//     ],
//   });

//   module.exports = logger;
//   logger.info(data,{type: 'EXPRESSION',id:id });

// }


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));