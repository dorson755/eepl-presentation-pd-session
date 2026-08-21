import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LiteracyMatchingGame = () => {
  const [matches, setMatches] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const words = [
    { id: 'listen', label: '1. Listen', matchId: 'voice' },
    { id: 'speak', label: '2. Speak', matchId: 'thoughts' },
    { id: 'read', label: '3. Read', matchId: 'story' },
    { id: 'write', label: '4. Write', matchId: 'marks' }
  ];

  const concepts = [
    { id: 'voice', label: 'A voice heard' },
    { id: 'thoughts', label: 'Thoughts expressed' },
    { id: 'story', label: 'Responding to a story' },
    { id: 'marks', label: 'Making marks on paper' }
  ].sort(() => Math.random() - 0.5); // shuffle

  const handleWordClick = (wordId) => {
    if (!matches[wordId]) setSelectedWord(wordId);
  };

  const handleConceptClick = (conceptId) => {
    if (!selectedWord) return;

    const word = words.find(w => w.id === selectedWord);
    if (word.matchId === conceptId) {
      const newMatches = { ...matches, [selectedWord]: conceptId };
      setMatches(newMatches);
      setSelectedWord(null);
      
      if (Object.keys(newMatches).length === words.length) {
        setIsComplete(true);
      }
    } else {
      // Wrong guess feedback could go here
      setSelectedWord(null);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '2rem' }}>
        Literacy Matching
      </h3>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        Match the foundational skill to its early childhood action.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Words Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {words.map(word => (
            <motion.button
              key={word.id}
              className={`btn ${selectedWord === word.id ? 'btn-primary' : matches[word.id] ? 'btn-glass' : 'btn-glass'}`}
              style={{
                opacity: matches[word.id] ? 0.5 : 1,
                borderColor: selectedWord === word.id ? 'var(--accent-primary)' : 'var(--border-glass)'
              }}
              onClick={() => handleWordClick(word.id)}
              disabled={!!matches[word.id]}
              whileHover={!matches[word.id] ? { scale: 1.05 } : {}}
              whileTap={!matches[word.id] ? { scale: 0.95 } : {}}
            >
              {word.label}
            </motion.button>
          ))}
        </div>

        {/* Concepts Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {concepts.map(concept => {
            const isMatchedBy = Object.keys(matches).find(k => matches[k] === concept.id);
            return (
              <motion.button
                key={concept.id}
                className="btn btn-glass"
                style={{
                  opacity: isMatchedBy ? 0.5 : 1,
                  background: isMatchedBy ? 'var(--accent-glow)' : 'var(--bg-glass)'
                }}
                onClick={() => handleConceptClick(concept.id)}
                disabled={!!isMatchedBy}
                whileHover={!isMatchedBy && selectedWord ? { scale: 1.05, borderColor: 'var(--accent-primary)' } : {}}
              >
                {concept.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginTop: '2rem', textAlign: 'center', padding: '1rem', background: 'rgba(44, 138, 102, 0.2)', borderRadius: '12px', border: '1px solid rgba(44, 138, 102, 0.4)' }}
          >
            <h4 style={{ color: '#34d399', fontSize: '1.5rem' }}>Perfect Match! 🎉</h4>
            <p style={{ marginTop: '0.5rem' }}>Literacy begins long before independent reading.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiteracyMatchingGame;
