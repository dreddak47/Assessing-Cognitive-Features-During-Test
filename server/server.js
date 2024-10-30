const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

// Mock database (in-memory)
const users = [];
const questions = [
  { id: 1, question: "What is 2 + 2?", options: ["3", "4", "5"], answer: "4" },
  { id: 2, question: "What is the capital of France?", options: ["Berlin", "Paris", "Madrid"], answer: "Paris" },
  { id: 3, question: "What is the capital of Germany?", options: ["Berlin", "Paris", "Madrid"], answer: "Paris" },
  { id: 4, question: "What is the capital of Spain?", options: ["Berlin", "Paris", "Madrid"], answer: "Paris" },
  { id: 5, question: "What is x+y?", options: ["0","1","2"], answer: "Paris" },
  { id: 6, question: "What is x+ey?", options: ["0","1e","2"], answer: "Pariseee" }

  // Add more questions as needed
];

// Register route
app.post('/register', (req, response) => {
  const { name, email, branch } = req.body;
  users.push({ name, email, branch });
  response.json({ message: "Registered successfully", user: { name, email, branch } });
});

// Get questions route
app.get('/questions', (req, res) => {
  res.json(questions);
});

app.post('/getscore', (req, res) => {
  console.log(req.body['answer']);
  const answers = req.body['answer']; // Assuming 'answer' is an array from the frontend
  let score = 0;
  let answerStatus = []; // This array will store the status for each answer

  questions.forEach((question, index) => {
    if (answers[index] === '') {
      // If no answer is submitted for this question
      answerStatus.push("not submitted");
    } else if (question.answer === answers[index]) {
      // If the answer is correct
      score += 1;
      answerStatus.push("correct");
    } else {
      // If the answer is incorrect
      answerStatus.push("incorrect");
    }
  });

  // Send both the score and answer status back to the client
  res.json({ score, answerStatus });
});


app.post('/log', (req, res) => {
  const { event, timestamp } = req.body;
  const logEntry = `Event: ${event}, Timestamp: ${timestamp}\n`;

  fs.appendFile(path.join(__dirname, 'logs', 'events.log'), logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file', err);
      return res.status(500).send('Error logging event');
    }
    res.status(200).send('Event logged');
  });
});

const storage = multer.diskStorage({
  destination:"./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}__${file.originalname}`); // Appends timestamp to original file name
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
}).single('image'); // Expecting a single file with field name 'image'

app.post('/upload', (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ message: 'File too large!' });
      console.log("not file uploaded successfully");
    } else if (err) {
      return res.status(500).send({ message: 'Failed to upload file!' });
      console.log("not file uploaded successfully");
    }
    res.status(200).send({ message: 'Upload successful!', file: req.file });
    console.log("file uploaded successfully")
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));