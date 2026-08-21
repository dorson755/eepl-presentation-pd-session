import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScenarioQuiz = () => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const scenario = "A parent tells you they don't have time to read books with their child every night because of their work schedule. What is the best response?";

  const options = [
    {
      id: 'a',
      text: "Explain that they must find 20 minutes a day, or the child will fall behind.",
      isCorrect: false,
      explanation: "This places a burden on already busy families and creates stress around reading."
    },
    {
      id: 'b',
      text: "Tell them not to worry, the school will handle all the literacy instruction.",
      isCorrect: false,
      explanation: "This misses the opportunity for the vital partnership between home and school."
    },
    {
      id: 'c',
      text: "Encourage simple moments of connection: singing a rhyme while cooking, or talking about pictures in a magazine.",
      isCorrect: true,
      explanation: "Exactly! The goal is connection, not burden. Simple shared moments are powerful literacy building blocks."
    }
  ];

  const handleSelect = (option) => {
    setSelectedAnswer(option.id);
    setShowExplanation(true);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem' }}>
        Scenario Quiz
      </h3>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <strong>Scenario:</strong> {scenario}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {options.map((option) => (
          <motion.button
            key={option.id}
            className={`btn ${selectedAnswer === option.id ? (option.isCorrect ? 'btn-primary' : 'btn-glass') : 'btn-glass'}`}
            style={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              padding: '1rem 1.5rem',
              borderColor: selectedAnswer === option.id ? (option.isCorrect ? '#34d399' : '#ef4444') : 'var(--border-glass)',
              background: selectedAnswer === option.id && option.isCorrect ? 'rgba(52, 211, 153, 0.2)' : ''
            }}
            onClick={() => handleSelect(option)}
            disabled={showExplanation}
            whileHover={!showExplanation ? { scale: 1.02 } : {}}
            whileTap={!showExplanation ? { scale: 0.98 } : {}}
          >
            {option.text}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: `1px solid ${options.find(o => o.id === selectedAnswer)?.isCorrect ? '#34d399' : '#ef4444'}` }}
          >
            <h4 style={{ color: options.find(o => o.id === selectedAnswer)?.isCorrect ? '#34d399' : '#ef4444', marginBottom: '0.5rem' }}>
              {options.find(o => o.id === selectedAnswer)?.isCorrect ? 'Correct!' : 'Not quite.'}
            </h4>
            <p>{options.find(o => o.id === selectedAnswer)?.explanation}</p>
            
            {!options.find(o => o.id === selectedAnswer)?.isCorrect && (
              <motion.button 
                className="btn btn-glass" 
                style={{ marginTop: '1rem' }}
                onClick={() => { setSelectedAnswer(null); setShowExplanation(false); }}
              >
                Try Again
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScenarioQuiz;
