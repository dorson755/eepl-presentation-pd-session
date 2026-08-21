import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playChime, playErrorTone } from '../../utils/sounds';
import { useLiveAudience } from '../../utils/useLiveAudience';

const DigitalSorting = () => {
  const [items, setItems] = useState([
    { id: '1', text: 'Watching videos without discussion', type: 'harmful' },
    { id: '2', text: 'Using educational apps together', type: 'helpful' },
    { id: '3', text: 'Replacing physical books entirely', type: 'harmful' },
    { id: '4', text: 'Asking questions about a digital story', type: 'helpful' }
  ].sort(() => Math.random() - 0.5));

  const [helpfulItems, setHelpfulItems] = useState([]);
  const [harmfulItems, setHarmfulItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const currentItem = items.length > 0 ? items[0] : null;
  const { audienceData, updateState } = useLiveAudience('DigitalSorting', {
    currentItem: currentItem ? currentItem.text : null,
    votes: { helpful: 0, harmful: 0 }
  });

  const handleSort = (item, category) => {
    setErrorMsg('');
    if (item.type === category) {
      playChime();
      if (category === 'helpful') {
        setHelpfulItems([...helpfulItems, item]);
      } else {
        setHarmfulItems([...harmfulItems, item]);
      }
      const newItems = items.filter(i => i.id !== item.id);
      setItems(newItems);
      
      if (newItems.length === 0) {
        updateState({ currentItem: null });
      } else {
        updateState({
          currentItem: newItems[0].text,
          votes: { helpful: 0, harmful: 0 }
        });
      }
    } else {
      playErrorTone();
      setErrorMsg(`"${item.text}" doesn't belong there.`);
      // Clear error after 2 seconds
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', fontSize: '2.5rem' }}>
        Digital Habits Sorting
      </h3>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
        Click a category to sort the highlighted habit.
      </p>

      {/* Current item to sort */}
      <div style={{ display: 'flex', justifyContent: 'center', minHeight: 80 }}>
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div
              key={items[0].id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-panel"
              style={{ padding: '1.5rem', fontSize: '1.4rem', border: '2px solid var(--accent-primary)' }}
            >
              {items[0].text}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: '2rem', color: '#34d399', fontWeight: 'bold' }}
            >
              All habits sorted! 🎉
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => currentItem && handleSort(currentItem, 'helpful')}
          style={{ flex: 1, padding: '1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        >
          Helpful Complement
          {audienceData?.votes?.helpful > 0 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '5px', background: '#fff', opacity: 0.8, width: `${(audienceData.votes.helpful / (audienceData.votes.helpful + (audienceData.votes.harmful || 0))) * 100}%`, transition: 'width 0.3s' }} />
          )}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => currentItem && handleSort(currentItem, 'harmful')}
          style={{ flex: 1, padding: '1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        >
          Harmful Replacement
          {audienceData?.votes?.harmful > 0 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '5px', background: '#fff', opacity: 0.8, width: `${(audienceData.votes.harmful / ((audienceData.votes.helpful || 0) + audienceData.votes.harmful)) * 100}%`, transition: 'width 0.3s' }} />
          )}
        </motion.button>
      </div>
      
      {(audienceData?.votes?.helpful > 0 || audienceData?.votes?.harmful > 0) && (
        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
          Live Audience Votes: {audienceData.votes.helpful} Helpful | {audienceData.votes.harmful} Harmful
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', minHeight: 30, color: '#ef4444' }}>
        <AnimatePresence>
          {errorMsg && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Sorting Buckets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Helpful */}
        <motion.div 
          className="glass-panel hover-lift"
          style={{ padding: '2rem', minHeight: 300, cursor: items.length > 0 ? 'pointer' : 'default', borderTop: '6px solid #34d399' }}
          onClick={() => items.length > 0 && handleSort(items[0], 'helpful')}
          whileTap={items.length > 0 ? { scale: 0.98 } : {}}
        >
          <h4 style={{ fontSize: '1.8rem', color: '#34d399', marginBottom: '1.5rem', textAlign: 'center' }}>Helpful Complement</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {helpfulItems.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '1rem', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.3)' }}
                >
                  {item.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Harmful */}
        <motion.div 
          className="glass-panel hover-lift"
          style={{ padding: '2rem', minHeight: 300, cursor: items.length > 0 ? 'pointer' : 'default', borderTop: '6px solid #ef4444' }}
          onClick={() => items.length > 0 && handleSort(items[0], 'harmful')}
          whileTap={items.length > 0 ? { scale: 0.98 } : {}}
        >
          <h4 style={{ fontSize: '1.8rem', color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center' }}>Harmful Replacement</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {harmfulItems.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                  {item.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DigitalSorting;
