import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Success.css'; // Import the CSS file
import Feedback from './Feedback/Feedback';

function Success() {
  const location = useLocation();
  const namewe = location.state?.name;
  const answer = location.state?.answer;

  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);
  const [showComponent, setShowComponent] = useState(false);
  const [answerstate, setAnswerstate] = useState([]); 

  useEffect(() => {
    // Send a POST request to the server with the answer
    const getScore = async () => {
      try {
        const response = await axios.post('http://localhost:5000/getScore', { answer });
        setScore(response.data.score);
        setAnswerstate(response.data.answerStatus);
      } catch (error) {
        console.error('Error fetching score:', error);
      } finally {
        setLoading(false); // Hide the loading bar after the response
      }
    };

    if (answer) {
      getScore();
    }
  }, [answer]);

  const handleClick = () => {
    const button = document.getElementById('feedbackButton');
    if (button) {
      button.style.display = 'none'; // Hide the button
    }
    setShowComponent(true); // Show the component when button is clicked
  };

  return (
    <div>
    <div className="success-container">
      <h1>Success!</h1>
      <h1>{namewe}, your Test has ended.</h1>

      {loading ? (
        <div className="loading-container">
          <p>Calculating your score, please wait...</p>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      ) : (
        <div className="score-container">
          <p>Your score is: {score}</p>
          
        </div>
      )}
      
    </div>
      <div className='Text'>
      <h2>Please help us with Feedback</h2>
      <button id='feedbackButton' onClick={handleClick}>Feedback</button>
      </div>
    
      {/* Conditionally render the component based on state */}
      {showComponent && <Feedback 
      answers={answer}
      timeTaken={location.state?.timeTaken}
      seenFirst={location.state?.seenFirst}
      submittedAfterSeen={location.state?.submittedAfterSeen}
      answerstatus={answerstate}
      />}
    </div>
  );
}

export default Success;