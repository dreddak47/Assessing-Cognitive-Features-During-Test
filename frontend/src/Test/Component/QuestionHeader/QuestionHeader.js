import React, { useEffect, useState } from 'react';
import './QuestionHeader.css';

const QuestionHeader = ({ totalQuestions, currentQuestion, handleQuestion ,reviewed }) => {
  const [startIndex, setStartIndex] = useState(0);
  const questionsPerPage = 5;

  useEffect(() => {
    if (currentQuestion >= startIndex + questionsPerPage) {
      setStartIndex(currentQuestion - questionsPerPage + 1);
    }
  }, [currentQuestion]);

  const handleNextSet = () => {
    if (startIndex + questionsPerPage < totalQuestions) {
      if(startIndex+2*questionsPerPage<totalQuestions){
        setStartIndex(startIndex + questionsPerPage);
      }else{
        setStartIndex(totalQuestions-questionsPerPage);
      }
    }
  };

  const handlePrevSet = () => {
    if (startIndex - questionsPerPage > 0) {
      setStartIndex(startIndex - questionsPerPage);
    }else{
      setStartIndex(0);
    }
  };


  return (
    <div className="question-header">
      <button onClick={handlePrevSet} disabled={startIndex === 0}>
        {'<'}
      </button>
      <div className="question-number-container">
        {Array.from({ length: Math.min(questionsPerPage, totalQuestions - startIndex) }).map((_, i) => {
          const questionIndex = startIndex + i;
          if(reviewed[questionIndex]===0){
            return (
              <div
                key={questionIndex}
                className={`question-number ${currentQuestion === questionIndex ? 'active' : ''}`}
                onClick={() => handleQuestion(questionIndex)}
              >
                {questionIndex + 1}
              </div>
            );}else if(reviewed[questionIndex]===1){
          return (
            <div
              key={questionIndex}
              className={`question-number reviewed ${currentQuestion === questionIndex ? 'active' : ''}`}
              onClick={() => handleQuestion(questionIndex)}
            >
              {questionIndex + 1}
            </div>
          );
        }else{
          return (
            <div
              key={questionIndex}
              className={`question-number submited ${currentQuestion === questionIndex ? 'active' : ''}`}
              onClick={() => handleQuestion(questionIndex)}
            >
              {questionIndex + 1}
            </div>
          );
        }
        })};
      </div>
      <button onClick={handleNextSet} disabled={startIndex + questionsPerPage >= totalQuestions}>
        {'>'}
      </button>
    </div>
  );
};

export default QuestionHeader;
