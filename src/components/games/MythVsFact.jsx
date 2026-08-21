import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playChime, playErrorTone } from '../../utils/sounds';
import { useLiveAudience } from '../../utils/useLiveAudience';

const statements = [
  { text: "Reading is just about learning letters and recognizing words.", isFact: false, explanation: "Reading develops the whole child—language, thinking, imagination, empathy, and confidence." },
  { text: "Every story read and rhyme sung shapes a child's future.", isFact: true, explanation: "Small moments become lifelong habits. Every little effort adds up." },
  { text: "Children naturally know about the diverse world around them.", isFact: false, explanation: "A child's world starts small. Books help them see beyond their own experiences." },
  { text: "Literacy begins long before a child reads independently.", isFact: true, explanation: "It begins with a voice heard, a page turned, and a picture pointed to." }
];

const MythVsFact = ({ isActive = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const { votes, publishState } = useLiveAudience('MythVsFact');

  useEffect(() => {
    if (isActive && !completed) {
      publishState({
        questionId: `mvf-${currentIndex}`,
        questionNumber: currentIndex + 1,
        totalQuestions: statements.length,
        questionText: statements[currentIndex].text,
        options: [
          { id: 'fact', label: 'FACT', color: '#10b981' },
          { id: 'myth', label: 'MYTH', color: '#ef4444' }
        ],
        votes: { fact: 0, myth: 0 },
        isComplete: false
      });
    }
  }, [currentIndex, isActive, completed, publishState]);

  const handleGuess = (guessFact) => {
    const current = statements[currentIndex];
    const correct = guessFact === current.isFact;
    
    if (correct) {
      setScore(s => s + 1);
      playChime();
    } else {
      playErrorTone();
    }
    
    setFeedback({
      correct,
      explanation: current.explanation
    });
  };

  const nextStatement = () => {
    setFeedback(null);
    const nextIndex = currentIndex + 1;
    if (nextIndex < statements.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCompleted(true);
      publishState({
        questionId: 'mvf-complete',
        isComplete: true
      });
    }
  };

  const factVotes = votes?.fact || 0;
  const mythVotes = votes?.myth || 0;
  const totalVotes = factVotes + mythVotes;
  const factPercent = totalVotes > 0 ? Math.round((factVotes / totalVotes) * 100) : 0;
  const mythPercent = totalVotes > 0 ? Math.round((mythVotes / totalVotes) * 100) : 0;

  return (
    <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: 800, margin: '0 auto', minHeight: 400 }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem' }}>
        Myth vs. Fact
      </h3>

      {!completed ? (
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
                  Statement {currentIndex + 1} of {statements.length}
                </h3>
                <p style={{ fontSize: '2.5rem', lineHeight: 1.4, margin: '0 0 2rem 0' }}>
                  "{statements[currentIndex].text}"
                </p>
              </motion.div>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleGuess(true)}
                  disabled={feedback !== null}
                  className="glass-panel hover-lift"
                  style={{ flex: 1, padding: '2rem', fontSize: '2rem', color: '#10b981', border: '2px solid rgba(16,185,129,0.3)', cursor: feedback ? 'default' : 'pointer', position: 'relative', overflow: 'hidden' }}>
                  FACT
                  {totalVotes > 0 && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: '6px', background: '#10b981', width: `${factPercent}%`, transition: 'width 0.3s' }} />
                  )}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleGuess(false)}
                  disabled={feedback !== null}
                  className="glass-panel hover-lift"
                  style={{ flex: 1, padding: '2rem', fontSize: '2rem', color: '#ef4444', border: '2px solid rgba(239,68,68,0.3)', cursor: feedback ? 'default' : 'pointer', position: 'relative', overflow: 'hidden' }}>
                  MYTH
                  {totalVotes > 0 && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: '6px', background: '#ef4444', width: `${mythPercent}%`, transition: 'width 0.3s' }} />
                  )}
                </motion.button>
              </div>
              
              {totalVotes > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>FACT: {factVotes} ({factPercent}%)</span>
                  <span>•</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>MYTH: {mythVotes} ({mythPercent}%)</span>
                </motion.div>
              )}

              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Audience can vote live on their devices • Click Fact/Myth on screen to reveal answer
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center' }}
            >
              <h4 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: feedback.correct ? '#34d399' : '#ef4444' }}>
                {feedback.correct ? 'Correct! 🎉' : 'Not quite.'}
              </h4>
              <p style={{ fontSize: '1.4rem', marginBottom: '2.5rem' }}>
                {feedback.explanation}
              </p>
              <motion.button 
                className="btn btn-primary"
                onClick={nextStatement}
                whileHover={{ scale: 1.05 }}
              >
                {currentIndex < statements.length - 1 ? 'Next Statement' : 'See Results'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <h4 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Activity Complete!</h4>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
            Score: <span className="text-gradient-accent" style={{ fontWeight: 'bold' }}>{score}</span> / {statements.length}
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Every small habit builds the foundation for lifelong learning.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MythVsFact;
