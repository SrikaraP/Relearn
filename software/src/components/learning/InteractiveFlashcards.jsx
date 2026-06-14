import React, { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import './InteractiveFlashcards.css';

const InteractiveFlashcards = ({ deck = [], onRegenerate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());

  if (!deck || deck.length === 0) return null;

  const currentCard = deck[currentIndex];
  const isKnown = knownCards.has(currentIndex);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
    }, 150);
  };

  const toggleKnown = (e) => {
    e.stopPropagation();
    setKnownCards(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  return (
    <div className="flashcard-container">
      <div className="flashcard-header flex-between mb-4">
        <span className="badge glass-panel">Card {currentIndex + 1} of {deck.length}</span>
        <div className="flex-align gap-2">
          <span className="text-sm text-secondary">Mastered: {knownCards.size} / {deck.length}</span>
          {onRegenerate && (
            <button className="btn btn-icon btn-outline" onClick={onRegenerate} title="Regenerate Deck">
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      <div className={`flashcard-scene`} onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard ${isFlipped ? 'is-flipped' : ''} ${isKnown ? 'border-success' : ''}`}>
          <div className="flashcard-face flashcard-front">
            <h3 className="card-content">{currentCard.q}</h3>
            <p className="hint-text">Click to flip</p>
          </div>
          <div className="flashcard-face flashcard-back">
            <div className="card-content answer-content">
              {currentCard.a}
            </div>
            <div className="card-actions" onClick={e => e.stopPropagation()}>
              <button 
                className={`btn ${isKnown ? 'btn-success' : 'btn-outline'}`}
                onClick={toggleKnown}
              >
                {isKnown ? <CheckCircle size={18} className="mr-2"/> : <CheckCircle size={18} className="mr-2"/>}
                {isKnown ? 'Mastered' : 'Mark as Mastered'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-controls mt-6 flex-between">
        <button className="btn btn-outline" onClick={handlePrev} disabled={deck.length <= 1}>
          <ArrowLeft size={18} className="mr-2"/> Previous
        </button>
        <div className="progress-dots">
          {deck.map((_, idx) => (
            <span key={idx} className={`dot ${idx === currentIndex ? 'active' : ''} ${knownCards.has(idx) ? 'known' : ''}`} />
          ))}
        </div>
        <button className="btn btn-outline" onClick={handleNext} disabled={deck.length <= 1}>
          Next <ArrowRight size={18} className="ml-2"/>
        </button>
      </div>
    </div>
  );
};

export default InteractiveFlashcards;
