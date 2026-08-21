import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, GraduationCap, MonitorPlay, Focus } from 'lucide-react';
import confetti from 'canvas-confetti';

const BookReveal = () => {
  const [revealed, setRevealed] = useState([]);

  const items = [
    { id: 'passport', icon: <Plane size={32} />, label: 'A passport.' },
    { id: 'teacher', icon: <GraduationCap size={32} />, label: 'A teacher.' },
    { id: 'window', icon: <MonitorPlay size={32} />, label: 'A window.' },
    { id: 'mirror', icon: <Focus size={32} />, label: 'Sometimes, a mirror.' }
  ];

  const handleReveal = (id) => {
    if (!revealed.includes(id)) {
      const newRevealed = [...revealed, id];
      setRevealed(newRevealed);
      
      if (newRevealed.length === items.length) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#34d399']
        });
      }
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
      <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '3rem' }}>
        A Book Is...
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.button
              className="glass-panel hover-lift"
              style={{
                width: '100%',
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                cursor: 'pointer',
                border: 'none',
                background: revealed.includes(item.id) ? 'var(--bg-glass-light)' : 'var(--bg-glass)',
                color: revealed.includes(item.id) ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
              onClick={() => handleReveal(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {revealed.includes(item.id) ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {item.icon}
                  <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</p>
                </motion.div>
              ) : (
                <div style={{ fontSize: '2rem', opacity: 0.5 }}>?</div>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {revealed.length === items.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '4rem' }}
          >
            <p className="text-gradient-accent" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
              Never underestimate the power of the book in your hands.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookReveal;
