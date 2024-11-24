import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './feedback.css'; // Import the CSS file
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Feedback=({answers,seenFirst,submittedAfterSeen,answerstatus}) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    
  const [isYesSelected, setIsYesSelected] = useState(false); // Track if "Yes" was selected
  const [guessType, setGuessType] = useState('');
    const [guess, setGuess] = useState([]); 
    const [Flag, setFlag] = useState('');

    useEffect(() => {
        var newflag='none submitted';
        for (let i = 0; i < answerstatus.length; i++) {
            if (answerstatus[i] !== 'not submitted') {
                newflag='few submitted';
                break;
            }
        }
        setFlag(newflag);
        axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/questions`)
          .then(response => {
              setQuestions(response.data)
              if(newflag!=='none submitted'){
                findNextSubmittedQuestion(0);
              }
              setGuess(response.data.map(() => true));
            })
          .catch(error => console.error('There was an error!', error));
          
          
        
      }, []);

    const navigate = useNavigate();
    
      const handleNext = () => {
        setIsYesSelected(false); // Reset selection for the next question
        setGuessType('');
        handleQuestionClick(currentQuestion+1)
      };

      const handleQuestionClick = (index) => {
        if(index===(questions.length)){
            console.log("End of Questions");
            setFlag('all submitted');
        }else{
          findNextSubmittedQuestion(index);
        }
      };

      const findNextSubmittedQuestion = (startIndex) => {
        // Find the next question that has been submitted
        for (let i = startIndex; i < answerstatus.length; i++) {
            if (answerstatus[i] !== 'not submitted') {
                setCurrentQuestion(i);
                return;
            }
        }
        setFlag('all submitted');
        
    };

      

      const handleYes = () => {
            setGuess(prevState => [...prevState.slice(0,currentQuestion),true,...prevState.slice(currentQuestion+1)]);
            setIsYesSelected(true);
            
        };  

        const handleNo = () => {        
            setGuess(prevState => [...prevState.slice(0,currentQuestion),false,...prevState.slice(currentQuestion+1)]);
            setIsYesSelected(false);
            handleNext();
        };

        const handleGuessType = (type) => {
          setGuessType(type); // Set the selected guess type
        };

  
      if(Flag==='none submitted'){
        return(
        <div className="test-container">
          <div className="question">
             <h2>None of the Question has been submitted</h2>
          </div>
        </div>
        );
      }
      if(Flag==='all submitted'){
        return(
        <div className="test-container">
          <div style={{ textAlign: 'center' }}>
             <h2> Your responses have been noted .Thanks for your Feedback! </h2>
          </div>
        </div>
        );
      }

  return (
    <div className="test-container">
      <h2 className="question">{questions[currentQuestion]?.question}</h2>
      <div className="nt-options">
        {questions[currentQuestion]?.options.map((option, index) => (
          <div
            key={index}
            className={`nt-option-box ${answers[currentQuestion] === index ? "selected" : ""}`}
          >
            <p className="option-text">{option}</p>
          </div>
        ))}
      </div>
      {/* <form className="options">
        {questions[currentQuestion]?.options.map((option, index) => (
          <div key={index} className="option">
            <input
              type="radio"
              id={`option${index}${currentQuestion}`}
              name={`option${index}`}
              value={option}
              checked={answers[currentQuestion] === option}
              disabled={true}
            />
            <label htmlFor={`option${index}`}>{option}</label>
          </div>
        ))}
        <h3>{answerstatus[currentQuestion]}</h3>
      </form> */}
      <div className="Guessed">
           <h2>Did You Guessed Your answer?</h2> 
           <br></br>
           <button onClick={handleYes} style={{ backgroundColor: isYesSelected ? '#ddd' : '' }} >Yes</button>
          <button onClick={handleNo}>No</button>
           {/* Show additional options if "Yes" is selected */}
            {isYesSelected && (
              <div>
              <div className="guess-options">
                <h3>Choose Type of Guess:</h3>
                <button
                  onClick={() => handleGuessType('random')}
                  className={guessType === 'random' ? 'selected' : ''}
                >
                  Random
                </button>
                <button
                  onClick={() => handleGuessType('strategic')}
                  className={guessType === 'strategic' ? 'selected' : ''}
                >
                  Strategic
                </button>
                <button
                  onClick={() => handleGuessType('intellectual')}
                  className={guessType === 'intellectual' ? 'selected' : ''}
                >
                  Intellectual
                </button>

          {/* Show Next button to proceed to the next question */}
                
              </div>
              <div>
                  <button  onClick={handleNext} className="next-button">Next</button>
                </div>
              </div>
            )}
      </div>
      <div className="timer">
        {/* <h3>Time Taken: {TimeperQuestion-timeTaken[currentQuestion]} seconds</h3> */}
        <h3>Seen First: {seenFirst[currentQuestion]>0?seenFirst[currentQuestion]:'Not seen'} {seenFirst[currentQuestion]>0?'Seconds':''}</h3>
        <h3>Submitted After Seen: {submittedAfterSeen[currentQuestion]>0?submittedAfterSeen[currentQuestion]:'Not submitted'} {submittedAfterSeen[currentQuestion]>0?'Seconds':''}</h3>
        </div>
    </div>
    
  );
}

export default Feedback;

