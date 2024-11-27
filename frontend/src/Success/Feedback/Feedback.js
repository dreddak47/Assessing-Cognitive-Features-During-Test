import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './feedback.css'; // Import the CSS file
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Feedback=({answers,seenFirst,submittedAfterSeen,answerstatus,id}) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    
  const [isYesSelected, setIsYesSelected] = useState(false); // Track if "Yes" was selected
  const [guessType, setGuessType] = useState('');
    const [guess, setGuess] = useState([]); 
    const [confarray, setConfarray] = useState([]);
    const [gtarray, setGtarray] = useState([]); 
    const [Flag, setFlag] = useState('');
    const [confidence, setConfidence] = useState(3); // Initial confidence value (middle of the range)
    const [completed, setCompleted] = useState(false); // Track if the feedback form has been completed

  const handleChange = (event) => {
    setConfidence(event.target.value); // Update confidence value dynamically
  };

  const logFeedback = async (logData) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/log`, {
        ...logData, // Spread the object to send its keys and values in the request body
        timestamp: new Date().toISOString(),
        
      });
      console.log('Log entry created' , logData);
    } catch (error) {
      console.error('There was an error logging the event!', error);
    }
  };

  useEffect(() => {
    if (completed) {
      // Log the feedback data if the form has been completed
      logFeedback({
        UserID: id,
        EventType: 'Feedback',
        confidence : confarray,
        guess : guess,
        guessType : gtarray,
      });
    }
  },[completed]);

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
              setGuess(response.data.map(() => ''));
              setConfarray(response.data.map(() => 3));
              setGtarray(response.data.map(() => ''));
            })
          .catch(error => console.error('There was an error!', error));
          
          
        
      }, []);

    const navigate = useNavigate();
    
      const handleNext = () => {
        setIsYesSelected(false); // Reset selection for the next question
        setGtarray(prevState => [...prevState.slice(0,currentQuestion),guessType,...prevState.slice(currentQuestion+1)]);
        setConfarray(prevState => [...prevState.slice(0,currentQuestion),confidence,...prevState.slice(currentQuestion+1)]);
        setGuessType('');
        setConfidence(3);
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
        setCompleted(true);
        
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
<br></br>
<div style={{ maxWidth: "400px", margin: "20px auto", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <label
        htmlFor="confidence-slider"
        style={{ fontSize: "18px", marginBottom: "10px", display: "block" }}
      >
        How confident are you about this?
      </label>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" ,fontSize :"12px"}}>
        <span>Not confident</span>
        
        <span>Neutral</span>
        
        <span>Very Confident</span>
      </div>
      <input
        type="range"
        id="confidence-slider"
        min="1"
        max="5"
        step="1"
        value={confidence}
        onChange={handleChange}
        style={{ width: "100%" }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>

      <div style={{ fontWeight: "bold", color: "#007bff", marginTop: "10px" }}>
        Confidence Level: {confidence}
      </div>
    </div>
      <div className="Guessed">
           <h2>Did You Guessed Your answer?</h2> 
           <br></br>
           <button onClick={handleYes} style={{ backgroundColor: isYesSelected ? '#ddd' : '' , color:  isYesSelected ? '#007bff' : 'white'}} >Yes</button><span> </span>
          <button onClick={handleNo}>No</button>
           {/* Show additional options if "Yes" is selected */}
            {isYesSelected && (
              <div>
              <div className="guess-options">
                <h3>Choose Type of Guess:</h3>
                <div className='info-container'> 
                <button
                  onClick={() => handleGuessType('random')}
                  className={guessType === 'random' ? 'selected' : ''}
                >
                  Random 
                </button> <div class="info-icon" data-tooltip="Randomly picked an option">i</div></div>
                <div className='info-container'> 
                <button
                  onClick={() => handleGuessType('strategic')}
                  className={guessType === 'strategic' ? 'selected' : ''}
                >
                  Strategic
                </button><div class="info-icon" data-tooltip="Adopted some guessing strategy like observing the answer patterns from the previous questions">i</div></div>
                <div className='info-container'> 
                <button
                  onClick={() => handleGuessType('intellectual')}
                  className={guessType === 'intellectual' ? 'selected' : ''}
                >
                  Intellectual
                </button><div class="info-icon" data-tooltip="Made a guess from the knowledge of some related topic of the given question.">i</div></div>

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
        <h3>Seen First: {Math.floor(seenFirst[currentQuestion]/ 60)>0?`${Math.floor(seenFirst[currentQuestion]/ 60)} minutes` : ''}  {seenFirst[currentQuestion] % 60!==0? `${seenFirst[currentQuestion]% 60} Seconds`:''}</h3>
        <h3>Submitted After Seen: {Math.floor(submittedAfterSeen[currentQuestion]/ 60)>0?`${Math.floor(submittedAfterSeen[currentQuestion]/ 60)} minutes` : ''}  {submittedAfterSeen[currentQuestion] % 60!==0? `${submittedAfterSeen[currentQuestion] % 60} Seconds`:''} </h3>
        </div>
    </div>
    
  );
}

export default Feedback;

