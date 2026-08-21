import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, listenToVoting } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Sparkles, Check, X } from 'lucide-react';

const Audience = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    // Listen to the global "live" session to know which game is active
    const unsubscribe = listenToVoting('live_presentation', (data) => {
      setActiveSession(data);
      // Reset vote status if the game changes or resets
      setVoted(false);
    });
    return () => unsubscribe();
  }, []);

  const handleVote = async (option) => {
    if (!activeSession || voted) return;
    
    try {
      setVoted(true);
      const ref = doc(db, 'sessions', 'live_presentation');
      await updateDoc(ref, {
        [`votes.${option}`]: increment(1)
      });
    } catch (e) {
      console.error(e);
      setVoted(false);
    }
  };

  if (!activeSession || !activeSession.activeGame) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <Sparkles size={48} className="text-gradient-accent" style={{ marginBottom: '2rem' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to EEPL PD Session</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Look at the projector screen. A poll will appear here shortly.</p>
      </div>
    );
  }

  // Render Myth vs Fact voting interface
  if (activeSession.activeGame === 'MythVsFact') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Statement {activeSession.currentIndex + 1}</h2>
        <div style={{ fontSize: '1.2rem', marginBottom: '3rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
          "{activeSession.currentStatement}"
        </div>
        
        {voted ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check /> Vote Cast! Look at the screen.
          </motion.div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote('fact')}
              style={{ flex: 1, padding: '1.5rem', fontSize: '1.2rem', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold' }}>
              FACT
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote('myth')}
              style={{ flex: 1, padding: '1.5rem', fontSize: '1.2rem', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold' }}>
              MYTH
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  // Render Digital Sorting voting interface
  if (activeSession.activeGame === 'DigitalSorting') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Where does this belong?</h2>
        <div style={{ fontSize: '1.5rem', marginBottom: '3rem', padding: '2rem', background: 'var(--bg-glass)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          {activeSession.currentItem}
        </div>
        
        {voted ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check /> Vote Cast!
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote('helpful')}
              style={{ padding: '1.5rem', fontSize: '1.2rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontWeight: 'bold' }}>
              Helpful Complement
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote('harmful')}
              style={{ padding: '1.5rem', fontSize: '1.2rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', fontWeight: 'bold' }}>
              Harmful Replacement
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Audience;
