import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react';

const InteractiveQuiz = ({ quiz = [], onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const currentQ = quiz[currentIdx];

  const handleSelect = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    
    if (option === currentQ.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (onComplete) onComplete(score + (selectedOption === currentQ.answer ? 1 : 0), quiz.length);
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="quiz-result text-center glass-panel p-5">
        <Award size={64} className={`mx-auto mb-4 ${percentage >= 80 ? 'text-success' : 'text-warning'}`} />
        <h3>Quiz Completed!</h3>
        <h1 className="display-score my-3">{percentage}%</h1>
        <p className="text-secondary mb-4">You scored {score} out of {quiz.length}</p>
        <div className="progress-bar-bg mb-4" style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
          <div className="progress-bar-fill" style={{ width: `${percentage}%`, height: '100%', background: percentage >= 80 ? 'var(--success)' : 'var(--warning)', borderRadius: '4px' }} />
        </div>
        {percentage < 80 && (
          <p className="text-sm text-warning bg-warning-light p-2 rounded">
            Based on this score, a review node will be added to your Skill Tree.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="interactive-quiz">
      <div className="quiz-header flex-between mb-4">
        <span className="badge glass-panel">Question {currentIdx + 1} of {quiz.length}</span>
        <span className="text-sm text-secondary">Score: {score}</span>
      </div>

      <div className="quiz-card glass-panel p-5 mb-4">
        <h3 className="mb-4" style={{ fontSize: '1.25rem', lineHeight: '1.5' }}>{currentQ.q}</h3>
        
        <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentQ.options.map((opt, i) => {
            let btnClass = 'btn btn-outline quiz-option text-left';
            let icon = null;
            
            if (isAnswered) {
              if (opt === currentQ.answer) {
                btnClass = 'btn quiz-option text-left btn-success';
                icon = <CheckCircle size={18} className="ml-auto"/>;
              } else if (opt === selectedOption) {
                btnClass = 'btn quiz-option text-left btn-danger';
                icon = <XCircle size={18} className="ml-auto"/>;
              }
            } else if (opt === selectedOption) {
              btnClass = 'btn quiz-option text-left border-primary';
            }

            return (
              <button 
                key={i} 
                className={`${btnClass} w-100 flex-align`}
                style={{ padding: '1rem', justifyContent: 'space-between', whiteSpace: 'normal', height: 'auto' }}
                onClick={() => handleSelect(opt)}
                disabled={isAnswered}
              >
                <span>{String.fromCharCode(65 + i)}. {opt}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="explanation-box mt-4 p-3 rounded" style={{ background: 'rgba(255,255,255,0.05)', borderLeft: `4px solid ${selectedOption === currentQ.answer ? 'var(--success)' : 'var(--danger)'}` }}>
            <p className="text-sm mb-0"><strong>Explanation:</strong> {currentQ.explanation}</p>
          </div>
        )}
      </div>

      <div className="quiz-footer flex-end">
        <button 
          className="btn btn-primary" 
          onClick={handleNext} 
          disabled={!isAnswered}
        >
          {currentIdx === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight size={18} className="ml-2"/>
        </button>
      </div>
    </div>
  );
};

export default InteractiveQuiz;
