import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './instruction.css'; // Import the CSS file

const InstructionsPage = () => {
  const [isChecked, setIsChecked] = useState(false);


  const navigate = useNavigate();

  const location = useLocation();
  const name = location.state?.info;
  const id = location.state?.id;

  const onStartQuiz = () => {
    navigate('/test',{ state: { info: name, id : id} });
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const testDetails = {
    title: 'Knowledge Knockout',
    duration: 30,
    numQuestions: 30,
    numSections:3
  };
  
  
  
  
  
  return (
    <div className="instructions-container">
      {/* Test Details */}
      <div className="test-details">
        <h1>{testDetails.title}</h1>
        <p><strong>Duration:</strong> {testDetails.duration} minutes</p>
        <p><strong>Number of Questions:</strong> {testDetails.numQuestions}</p>
        <p><strong>Name: </strong> {name} </p>
      </div>

      <hr className="divider" />

      {/* Instructions */}
      <div className="instructions">
        <h3>Instructions for the Test:</h3>
        <ul>
          <li>This examination consists of three sets of questions, with each set containing 10 multiple-choice questions. You have <b>30 minutes</b> to complete the entire test, and <b>there is no negative marking</b>.</li>
          <li>You may navigate between questions freely, moving to the next or previous question at any time. <b>Your answer will only be saved once you click the "submit" button for that specific question.</b></li>
          <li>Once you've finished the test, please click the <b>"End Test"</b> button. The test will also automatically end when the time limit is reached.</li>
          <li>After completing the test, <b>kindly provide your feedback by filling out the questions in the feedback section</b>.</li>
        </ul>
      </div>

      {/* Terms and Conditions */}
      <div className="terms-container">
        <label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          I have read and agree to the terms and conditions.
        </label>
      </div>

      {/* Start Quiz Button */}
      <div className="button-container">
        <button
          className="start-button"
          onClick={onStartQuiz}
          disabled={!isChecked}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default InstructionsPage;
