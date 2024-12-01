import React, {useRef,  useEffect, useState } from 'react';
import axios from 'axios';
import Cam from './Component/camera/camera';
import QuestionHeader from './Component/QuestionHeader/QuestionHeader'; 
import './testq.css'; // Import the CSS file
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



const Test = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerstmp, setAnswerstmp] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedOption, setSelectedOption] = useState(-1);
  // const [timeLeft, setTimeLeft] = useState([]);
  
  const [TotalTime, settotalTime] = useState(0);
  const [disbs, setdisbs] = useState([]);
  const [firsttime, setfirsttime] = useState([]);
  const [sfirsttime, setsfirsttime] = useState([]);
  const [reviewed, setreviewed] = useState([]);
  const nsubmitted=useRef(0);
  const navigate = useNavigate();

  const location = useLocation();
  const namewe = location.state?.info;
  const id = location.state?.id;

  const [showPopup, setShowPopup] = useState(false);

  const handleEndTest = () => {
    if(nsubmitted.current===questions.length){
      setShowPopup(true); // Show the popup
    }else{
      alert('You have not submitted all answers. Please submit all answers before ending the test');
    }
  };

  const closePopup = () => {
    setShowPopup(false); // Close the popup
  };

  const confirmEndTest = () => {
    // Logic to handle end test confirmation
    console.log("Test ended");
    setShowPopup(false);
    // Navigate or perform any final actions here
  };
  
  


  const TimeperQuestion = 60;
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/questions`)
      .then(response => {
          setQuestions(response.data)
          // setTimeLeft(response.data.map(() => TimeperQuestion));
          setAnswers(response.data.map(() => -1));
          setdisbs(response.data.map(() => 2));
          setfirsttime(response.data.map(() => -1));
          setsfirsttime(response.data.map(() => -1));
          setAnswerstmp(response.data.map(() => -1));
          setreviewed(response.data.map(() => 0));
          logEvent({
            UserID: id,
            EventType : 'START',
            TimeElapsed: 0
          });
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

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers; // Keep the ref updated with the latest answers
  }, [answers]);
  

  //LOGGING FUNCTION
  const logEvent = async (logData) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_BASEURL}/log`, {
        ...logData, // Spread the object to send its keys and values in the request body
        timestamp: new Date().toISOString(),
        
      });
      console.log('Log entry created');
    } catch (error) {
      console.error('There was an error logging the event!', error);
    }
  };

  const handleOptionSelect = (index) => {
    if(disbs[currentQuestion]!==1){ 
    setSelectedOption(index);
    const newdisbs = [...disbs];
    newdisbs[currentQuestion] = 0;
    setdisbs(newdisbs);
    const newAnswerstmp = [...answerstmp];
    newAnswerstmp[currentQuestion] = index;
    setAnswerstmp(newAnswerstmp);}
  };

  const handleQuestionClick = (index) => {
    if(0<=index && index<=questions.length-1){
      changeQuestion(index);
    }
  };

  const changeQuestion = (index) => {
    logEvent({
      UserID: id,
      EventType : 'QChange',
      TimeElapsed: questions.length*TimeperQuestion-TotalTime,
      Qn : currentQuestion,
      Qnto : index,
      submitted: disbs[currentQuestion]===1?"Yes":"No"
    });

    if(firsttime[index]===-1){
      const newfirsttime = [...firsttime];
      newfirsttime[index] = TimeperQuestion*questions.length - TotalTime; 
      logEvent({
        UserID: id,
        EventType : 'Qfirstseen',
        TimeElapsed: questions.length*TimeperQuestion-TotalTime,
        Qn : index,
        FirsttimeSeen : newfirsttime[index]
      });
      setfirsttime(newfirsttime)
    }
    setSelectedOption('');
    setCurrentQuestion(index);
  };

  const handleReview = () => {
    setreviewed([...reviewed.slice(0,currentQuestion),1,...reviewed.slice(currentQuestion+1)]);
    logEvent({
      UserID: id,
      EventType : 'REVIEWED',
      TimeElapsed: questions.length*TimeperQuestion-TotalTime,
      Qn : currentQuestion,
    });
  };

  const handlesubmit = () => {
    nsubmitted.current+=1;
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
    setreviewed([...reviewed.slice(0,currentQuestion),2,...reviewed.slice(currentQuestion+1)]);
    logEvent({
      UserID: id,
      EventType : 'QSubmit',
      TimeElapsed: questions.length*TimeperQuestion-TotalTime ,
      Qn : currentQuestion ,
      Soption: selectedOption,
      FirsttimeSeen : firsttime[currentQuestion] ,
      ResponseTime : newsfirsttime[currentQuestion]
    });
    
    handleQuestionClick(currentQuestion+1) 
  };
  
  const handlePrev = () => {
    logEvent({
      UserID: id,
      EventType : 'PREV',
      TimeElapsed: questions.length*TimeperQuestion-TotalTime
    });
    handleQuestionClick(currentQuestion-1)
  };
  
  const reminder = () => { 
    if(reviewed[currentQuestion]===0 && disbs[currentQuestion]===0){
      return <h5 className='points'>Click Submit to Submit answers</h5>
    }else if(reviewed[currentQuestion]===1){
      return <h5 className='points'>Question Marked for Review. Click Submit to Submit answers</h5>
    }else if(reviewed[currentQuestion]===2){
      return <h5 className='points'>Question Submitted. You cannot change your answers</h5>
    }else{
      return <h5 ></h5>
    }

  };
  
  const end = (e) => {
    logEvent({
      UserID: id,
      EventType : 'END',
      TimeElapsed: questions.length*TimeperQuestion-TotalTime
    });
    console.log(answersRef.current);
    navigate('/success',{state:{name:namewe,id:id,answer:answersRef.current,seenFirst:firsttime,submittedAfterSeen:sfirsttime}}); // Call the endTest function
  };

  if (!questions.length) return <div>If your test has not started, please reload</div>;

  return (
  <div className="container">
    <div className="sidebar">
      
      <nav className="nav-menu">
        <a><h3 className='name_nav'><b>Name: {namewe}</b></h3></a>
        <h3><b>Time Left : {Math.floor(TotalTime / 60) }m {TotalTime % 60 }s</b></h3>
        <h1>Knowledge Knockout</h1>
        <p><ul>
            <li> <b>Section 1</b> : HCI</li>
            <li> <b>Section 2</b> : IP</li>
            <li> <b>Section 3</b> : Maths</li>
          </ul>
        </p>
        <br></br>
        <a className="endtest"  onClick={handleEndTest}><b>End Test</b></a>
        <div className='navbar_endtest'>
          
          <h5 className='points'><b>Use your Non-dominant hand.</b></h5>
        </div>
        
      </nav>
      
    </div>
    <div className="cnt">
    <div className="test-container">
      <Cam 
      id={id}
      />
      <QuestionHeader 
        totalQuestions={questions.length} 
        currentQuestion={currentQuestion} 
        handleQuestion={handleQuestionClick} 
        reviewed={reviewed}
      />
      <h2
        className="question"
        dangerouslySetInnerHTML={{
          __html: `Q${currentQuestion + 1} ${questions[currentQuestion].question}`,
        }}
      />
      <div className="options">
        {questions[currentQuestion].options.map((option, index) => (
          <div
            key={index}
            className={`option-box ${(selectedOption === index || answerstmp[currentQuestion] === index)? "selected" : ""}`}
            onClick={() => handleOptionSelect(index)}
          >
            <p className="option-text">{option}</p>
          </div>
        ))}
      </div>
      <div className="button-container">
        <button onClick={handlesubmit} disabled={disbs[currentQuestion]!==0} className={`submit_${disbs[currentQuestion]===2 ? "ns":"s"}`}>Submit</button>
        <button onClick={handleReview} disabled={disbs[currentQuestion]===1 || reviewed[currentQuestion]===1} >Mark for Review</button>
      </div>
      <div className="timer">
         {reminder()}
      </div>
    </div>

    </div>
    {/* Popup Overlay */}
    {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>End Test</h3>
            <p>Are you sure you want to end the test?</p>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={end}>
                Yes, End Test
              </button>
              <button className="cancel-btn" onClick={closePopup} >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>


  );
};

export default Test;