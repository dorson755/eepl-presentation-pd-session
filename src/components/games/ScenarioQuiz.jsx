import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playChime, playErrorTone } from '../../utils/sounds';
import { useLiveAudience } from '../../utils/useLiveAudience';

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

const ScenarioQuiz = ({ isActive = true }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { votes, publishState } = useLiveAudience('ScenarioQuiz');

  useEffect(() => {
    if (isActive) {
      publishState({
        questionId: 'scenario-0',
        questionNumber: 1,
        totalQuestions: 1,
        questionText: scenario,
        options: options.map(o => ({ id: o.id, label: o.text })),
        votes: { a: 0, b: 0, c: 0 },
        isComplete: false
      });
    }
  }, [isActive, publishState]);

  const handleSelect = (option) => {
    setSelectedAnswer(option.id);
    setShowExplanation(true);
    if (option.isCorrect) {
      playChime();
    } else {
      playErrorTone();
    }
  };

  const totalVotes = Object.values(votes || {}).reduce((sum, v) => sum + (v || 0), 0);

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: 850, margin: '0 auto' }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2.5rem' }}>
        Classroom Scenario
      </h3>
      <p style={{ fontSize: '1.4rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', lineHeight: 1.5 }}>
        <strong>Scenario:</strong> {scenario}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {options.map((option) => {
          const optVotes = votes?.[option.id] || 0;
          const optPercent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;

          return (
            <motion.button
              key={option.id}
              className={`btn ${selectedAnswer === option.id ? (option.isCorrect ? 'btn-primary' : 'btn-glass') : 'btn-glass'}`}
              style={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                padding: '1.2rem 1.5rem',
                fontSize: '1.1rem',
                position: 'relative',
                overflow: 'hidden',
                borderColor: selectedAnswer === option.id ? (option.isCorrect ? '#34d399' : '#ef4444') : 'var(--border-glass)',
                background: selectedAnswer === option.id && option.isCorrect ? 'rgba(52, 211, 153, 0.2)' : ''
              }}
              onClick={() => handleSelect(option)}
              disabled={showExplanation}
              whileHover={!showExplanation ? { scale: 1.01 } : {}}
              whileTap={!showExplanation ? { scale: 0.99 } : {}}
            >
              <span style={{ fontWeight: 'bold', marginRight: '0.8rem', color: 'var(--accent-primary)' }}>
                {option.id.toUpperCase()}.
              </span>
              <span style={{ flex: 1 }}>{option.text}</span>
              {totalVotes > 0 && (
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>
                  {optVotes} ({optPercent}%)
                </span>
              )}
              {totalVotes > 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: 'var(--accent-primary)', width: `${optPercent}%`, transition: 'width 0.3s' }} />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: `1px solid ${options.find(o => o.id === selectedAnswer)?.isCorrect ? '#34d399' : '#ef4444'}` }}
          >
            <h4 style={{ color: options.find(o => o.id === selectedAnswer)?.isCorrect ? '#34d399' : '#ef4444', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
              {options.find(o => o.id === selectedAnswer)?.isCorrect ? 'Correct! 🎉' : 'Not quite.'}
            </h4>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.5 }}>{options.find(o => o.id === selectedAnswer)?.explanation}</p>
            
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
