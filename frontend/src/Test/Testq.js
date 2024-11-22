import React, {useRef,  useEffect, useState } from 'react';
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
  const [answerstmp, setAnswerstmp] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedOption, setSelectedOption] = useState(-1);
  const [timeLeft, setTimeLeft] = useState([]);
  
  const [TotalTime, settotalTime] = useState(0);
  const [disbs, setdisbs] = useState([]);
  const [firsttime, setfirsttime] = useState([]);
  const [sfirsttime, setsfirsttime] = useState([]);
  const navigate = useNavigate();

  const location = useLocation();
  const namewe = location.state?.info;
  const id = location.state?.id;

  // useEffect(() => {
  //   const webgazer=window.webgazer;
  //   webgazer.setGazeListener((data, elapsedTime)=>{
  //     // console.log(data,elapsedTime);
  //     axios
  //     .post("http://localhost:5000/receive-gazer", { data,elapsedTime })
  //     .catch((error) => console.error("Error sending frame to Node.js: ", error));
  //   }).begin();
  // }, []);

  // const videoRef = useRef(null);
  // const canvasRef = useRef(null);

  // useEffect(() => {
  //   // Access the webcam
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true })
  //     .then((stream) => {
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //       }
  //     })
  //     .catch((err) => console.error("Error accessing webcam: ", err));

  //   // Start sending frames every 1 second
  //   const intervalId = setInterval(() => {
  //     if (canvasRef.current && videoRef.current) {
  //       const canvas = canvasRef.current;
  //       const video = videoRef.current;

  //       // Draw the current video frame to the canvas
  //       const ctx = canvas.getContext("2d");
  //       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  //       // Convert canvas to Base64 image
  //       const image = canvas.toDataURL("image/jpeg");

  //       // Send the frame to Flask server
  //       axios
  //         .post("http://localhost:5000/receive-image", { frame: image })
  //         .catch((error) => console.error("Error sending frame to Node.js: ", error));
  //     }
  //   }, 3000);

  //   return () => clearInterval(intervalId);
  // }, []);

  


  const TimeperQuestion = 50;
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_BASEURL}/questions`)
      .then(response => {
          setQuestions(response.data)
          setTimeLeft(response.data.map(() => TimeperQuestion));
          setAnswers(response.data.map(() => -1));
          setdisbs(response.data.map(() => 0));
          setfirsttime(response.data.map(() => -1));
          setsfirsttime(response.data.map(() => -1));
          setAnswerstmp(response.data.map(() => -1));
          logEvent({
            UserID: id,
            EventType : 'START',
            Time: 0
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
  
  const [timerId, setTimerId] = useState(null);
  useEffect(() => {
      if(questions.length >0){
      
      const newTimerId = setInterval(() => {
      setTimeLeft(prevTimeLeft => {
        const newTimeLeft = [...prevTimeLeft];
      
        if (newTimeLeft[currentQuestion] >= 0 && disbs[currentQuestion]===0) {
          newTimeLeft[currentQuestion] -=1;
          if (newTimeLeft[currentQuestion] === 0) {
            logEvent({
              UserID: id,
              EventType : 'QTimeout',
              Time: questions.length*TimeperQuestion-TotalTime ,
              Qn : currentQuestion
            });
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

  // const handleOptionChange = (e) => {
  //   const selectedValue = parseInt(e.target.value, 10);
  //   setSelectedOption(selectedValue);
  //   const newAnswerstmp = [...answerstmp];
  //   newAnswerstmp[currentQuestion] = selectedValue;
  //   setAnswerstmp(newAnswerstmp);
  // };

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
    const newAnswerstmp = [...answerstmp];
    newAnswerstmp[currentQuestion] = index;
    setAnswerstmp(newAnswerstmp);
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
      Time: questions.length*TimeperQuestion-TotalTime,
      Qn : currentQuestion,
      Qnto : index,
      submitted: disbs[currentQuestion]===1?"Yes":"No",
      TimeLeft: TimeperQuestion-timeLeft[currentQuestion]
    });

    //logEvent(`Question: ${currentQuestion} to ${index} | submitted: ${disbs[currentQuestion]===1?"Yes":"No"} | TimeLeft: ${TimeperQuestion-timeLeft[currentQuestion]} seconds`);
    if(firsttime[index]===-1){
      const newfirsttime = [...firsttime];
      newfirsttime[index] = TimeperQuestion*questions.length - TotalTime; 
      logEvent({
        UserID: id,
        EventType : 'Qfirstseen',
        Time: questions.length*TimeperQuestion-TotalTime,
        Qn : index,
        FirsttimeSeen : newfirsttime[index]
      });
      //logEvent(`First time seen Question: ${index} = ${newfirsttime[index]} seconds`);
      setfirsttime(newfirsttime)
    }
    setSelectedOption('');
    setCurrentQuestion(index);
  };

  const handleNext = () => {
    logEvent({
      UserID: id,
      EventType : 'NEXT',
      Time: questions.length*TimeperQuestion-TotalTime
    });

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

    logEvent({
      UserID: id,
      EventType : 'QSubmit',
      Time: questions.length*TimeperQuestion-TotalTime ,
      Qn : currentQuestion ,
      Soption: selectedOption,
      timeTaken : TimeperQuestion-timeLeft[currentQuestion],
      FirsttimeSeen : firsttime[currentQuestion] ,
      Timefromfirstseen : newsfirsttime[currentQuestion]
    });
    //logEvent(`Submitted Question: ${currentQuestion} -> ${selectedOption} | timeTaken : ${TimeperQuestion-timeLeft[currentQuestion]} seconds | FirsttimeSeen : ${firsttime[currentQuestion]} seconds | Timefromfirstseen : ${newsfirsttime[currentQuestion]} seconds`);
    handleNext(); 
  };
  
  const handlePrev = () => {
    logEvent({
      UserID: id,
      EventType : 'PREV',
      Time: questions.length*TimeperQuestion-TotalTime
    });
    handleQuestionClick(currentQuestion-1)
  };
  

  
  const end = (e) => {
    e.preventDefault(); // Prevent default link behavior
    logEvent({
      UserID: id,
      EventType : 'END',
      Time: questions.length*TimeperQuestion-TotalTime
    });
    navigate('/success',{state:{name:namewe,id:id,answer:answers,timeTaken:timeLeft,seenFirst:firsttime,submittedAfterSeen:sfirsttime}}); // Call the endTest function
  };

  if (!questions.length) return <div>If your test has not started, please reload</div>;

  return (
    <div >
    <Sidebar Totaltime={TotalTime} name={namewe} handleEndTestClick={end}/>
    <div className="test-container">
      <TestQ />
      {/* <div>
          <video ref={videoRef} autoPlay muted width="640" height="480" style={{ display: "none" }} />
          <canvas ref={canvasRef} width="640" height="480" style={{ display: "none" }} />
        </div> */}
      <QuestionHeader 
        totalQuestions={questions.length} 
        currentQuestion={currentQuestion} 
        handleQuestion={handleQuestionClick} 
      />
      
      <h2 className="question">{questions[currentQuestion].question}</h2>
      <div className="options">
        {questions[currentQuestion].options.map((option, index) => (
          <div
            key={index}
            className={`option-box ${selectedOption === index || answerstmp[currentQuestion] === index ? "selected" : ""}`}
            onClick={() => handleOptionSelect(index)}
          >
            <p className="option-text">{option}</p>
          </div>
        ))}
      </div>
      {/* <form className="options">
        {questions[currentQuestion].options.map((option, index) => (
          <div key={index} className="option">
            <input
              type="radio"
              id={`option${index}${currentQuestion}`}
              name={`option${index}`}
              value={index}
              checked={selectedOption === index || answerstmp[currentQuestion] === index}
              onChange={handleOptionChange}
            />
            <label htmlFor={`option${index}`}>{option}</label>
          </div>
        ))}
      </form> */}
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