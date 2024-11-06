import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TestQ from './Component/camera/camera';
import QuestionHeader from './Component/QuestionHeader/QuestionHeader'; 
import './testq.css'; // Import the CSS file
import Sidebar from './Component/sidebar/Sidebar';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const Test = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [timeLeft, setTimeLeft] = useState([]);
  const [timerId, setTimerId] = useState(null);
  const [TotalTime, settotalTime] = useState(0);
  const [disbs, setdisbs] = useState([]);
  const [firsttime, setfirsttime] = useState([]);
  const [sfirsttime, setsfirsttime] = useState([]);
  const navigate = useNavigate();

  const location = useLocation();
  const namewe = location.state?.info;

  const TimeperQuestion = 50;
  useEffect(() => {
    axios.get(`${import.meta.env.BACKEND_BASEURL}/questions`)
      .then(response => {
          setQuestions(response.data)
          setTimeLeft(response.data.map(() => TimeperQuestion));
          setAnswers(response.data.map(() => ''));
          setdisbs(response.data.map(() => 0));
          setfirsttime(response.data.map(() => -1));
          setsfirsttime(response.data.map(() => -1));
          logEvent(`Test started for user: ${namewe}`);
          setCurrentQuestion(0);
          setfirsttime(prevState => [1, ...prevState.slice(1)]);
        })
      .catch(error => console.error('There was an error!', error));
  }, []);
  
  useEffect(() => {
    settotalTime(questions.length*TimeperQuestion);
  }, [questions.length]);

  useEffect(() => {
    // Start the timer when the component mounts

    const interval = setInterval(() => {
      settotalTime((prevSeconds) => {
        if (prevSeconds === 0) {
          clearInterval(interval);
          end();
          return 0;
        }
        return prevSeconds - 1
      }); // Increment the timer
    }, 1000); // Runs every 1000 milliseconds (1 second)

    // Cleanup function to stop the timer when the component unmounts
    return () => clearInterval(interval);
  }, []);
  
  

  useEffect(() => {
      if(questions.length >0){
      clearInterval(timerId);
      const newTimerId = setInterval(() => {
      setTimeLeft(prevTimeLeft => {
        const newTimeLeft = [...prevTimeLeft];
        if (newTimeLeft[currentQuestion] >= 0 && disbs[currentQuestion]===0) {
          newTimeLeft[currentQuestion] -=1;
          if (newTimeLeft[currentQuestion] === 0) {
            logEvent(`Time ended for ${currentQuestion}`);
            handleNext();
            newTimeLeft[currentQuestion] -=1;
          }
        }
        return newTimeLeft;
      });
    }, 1000);
    setTimerId(newTimerId);
    // Clean up timer when component unmounts
  }
    return () => clearInterval(timerId);
  }, [currentQuestion]);

  const logEvent = async (event) => {
    try {
      await axios.post(`${import.meta.env.BACKEND_BASEURL}/log`, {
        event: event,
        timestamp: new Date().toISOString(),
      });
      console.log('Log entry created');
    } catch (error) {
      console.error('There was an error logging the event!', error);
    }
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleQuestionClick = (index) => {
    if(0<=index && index<=questions.length-1){
      changeQuestion(index);
    }
  };

  const changeQuestion = (index) => {
    logEvent(`Question: ${currentQuestion} to ${index} | submitted: ${disbs[currentQuestion]===1?"Yes":"No"} | TimeLeft: ${TimeperQuestion-timeLeft[currentQuestion]} seconds`);
    if(firsttime[index]===-1){
      const newfirsttime = [...firsttime];
      newfirsttime[index] = TimeperQuestion*questions.length - TotalTime; 
      logEvent(`First time seen Question: ${index} = ${newfirsttime[index]} seconds`);
      setfirsttime(newfirsttime)
    }
    setSelectedOption('');
    setCurrentQuestion(index);
  };

  const handleNext = () => {
    logEvent('Next')
    handleQuestionClick(currentQuestion+1)
  
  };

  const handlesubmit = () => {
    
    const newAnswers = [...answers];
    const newdisbs = [...disbs];
    const newsfirsttime = [...sfirsttime];
    newsfirsttime[currentQuestion] = (TimeperQuestion*questions.length - TotalTime) - firsttime[currentQuestion];
    newAnswers[currentQuestion] = selectedOption;
    newdisbs[currentQuestion] = 1;
    setsfirsttime(newsfirsttime);
    setAnswers(newAnswers);
    setdisbs(newdisbs);
    console.log(newAnswers);
    logEvent(`Submitted Question: ${currentQuestion} -> ${selectedOption} | timeTaken : ${TimeperQuestion-timeLeft[currentQuestion]} seconds | FirsttimeSeen : ${firsttime[currentQuestion]} seconds | Timefromfirstseen : ${newsfirsttime[currentQuestion]} seconds`);
    handleNext(); 
  };
  
  const handlePrev = () => {
    logEvent('Previous')
    handleQuestionClick(currentQuestion-1)
  };
  

  
  const end = (e) => {
    e.preventDefault(); // Prevent default link behavior
    logEvent('Test Ended ')
    navigate('/success',{state:{name:namewe,answer:answers,timeTaken:timeLeft,seenFirst:firsttime,submittedAfterSeen:sfirsttime}}); // Call the endTest function
  };

  if (!questions.length) return <div>If your test has not started, please reload</div>;

  return (
    <div >
    <Sidebar Totaltime={TotalTime} name={namewe} handleEndTestClick={end}/>
    <div className="test-container">
      <TestQ />
      <QuestionHeader 
        totalQuestions={questions.length} 
        currentQuestion={currentQuestion} 
        handleQuestion={handleQuestionClick} 
      />
      
      <h2 className="question">{questions[currentQuestion].question}</h2>
      <form className="options">
        {questions[currentQuestion].options.map((option, index) => (
          <div key={index} className="option">
            <input
              type="radio"
              id={`option${index}${currentQuestion}`}
              name={`option${index}`}
              value={option}
              checked={selectedOption === option || answers[currentQuestion] === option}
              onChange={handleOptionChange}
            />
            <label htmlFor={`option${index}`}>{option}</label>
          </div>
        ))}
      </form>
      <div className="button-container">
        <button onClick={handlePrev} disabled={currentQuestion===0}>Previous</button>
        <button onClick={handlesubmit} disabled={timeLeft[currentQuestion]<=0 || disbs[currentQuestion]===1}>Submit</button>
        <button onClick={handleNext} disabled={currentQuestion===questions.length-1}>Next</button>
      </div>
      <div className="timer">Time left: {timeLeft[currentQuestion]>0?timeLeft[currentQuestion]:0} seconds</div>
    </div>


    </div>


  );
};

export default Test;