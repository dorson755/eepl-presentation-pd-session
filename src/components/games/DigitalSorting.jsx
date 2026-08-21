import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playChime, playErrorTone } from '../../utils/sounds';
import { useLiveAudience } from '../../utils/useLiveAudience';
import { SlideContext } from 'spectacle';

const initialItems = [
  { id: '1', text: 'Using educational apps together with child interaction', type: 'helpful' },
  { id: '2', text: 'Watching videos passively without discussion', type: 'harmful' },
  { id: '3', text: 'Interactive digital stories with questions & dialogue', type: 'helpful' },
  { id: '4', text: 'Replacing bedtime storybooks entirely with solo screen time', type: 'harmful' }
];

const DigitalSorting = () => {
  const { isSlideActive } = useContext(SlideContext);
  const [items, setItems] = useState(initialItems);
  const [helpfulItems, setHelpfulItems] = useState([]);
  const [harmfulItems, setHarmfulItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [completed, setCompleted] = useState(false);

  const currentItem = items.length > 0 ? items[0] : null;
  const { votes, publishState } = useLiveAudience('DigitalSorting');

  useEffect(() => {
    if (isSlideActive && currentItem && !completed) {
      publishState({
        questionId: `sort-${currentItem.id}`,
        questionNumber: initialItems.length - items.length + 1,
        totalQuestions: initialItems.length,
        questionText: currentItem.text,
        options: [
          { id: 'helpful', label: 'Helpful Complement', color: '#3b82f6' },
          { id: 'harmful', label: 'Harmful Replacement', color: '#ef4444' }
        ],
        votes: { helpful: 0, harmful: 0 },
        isComplete: false
      });
    } else if (isSlideActive && completed) {
      publishState({
        questionId: 'sort-complete',
        isComplete: true
      });
    }
  }, [items, currentItem, isSlideActive, completed, publishState]);

  const handleSort = (item, category) => {
    setErrorMsg('');
    if (item.type === category) {
      playChime();
      if (category === 'helpful') {
        setHelpfulItems([...helpfulItems, item]);
      } else {
        setHarmfulItems([...harmfulItems, item]);
      }
      const newItems = items.slice(1);
      setItems(newItems);
      
      if (newItems.length === 0) {
        setCompleted(true);
      }
    } else {
      playErrorTone();
      setErrorMsg(`"${item.text}" is actually a ${item.type === 'helpful' ? 'helpful complement' : 'harmful replacement'}.`);
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  const helpfulVotes = votes?.helpful || 0;
  const harmfulVotes = votes?.harmful || 0;
  const totalVotes = helpfulVotes + harmfulVotes;
  const helpfulPercent = totalVotes > 0 ? Math.round((helpfulVotes / totalVotes) * 100) : 0;
  const harmfulPercent = totalVotes > 0 ? Math.round((harmfulVotes / totalVotes) * 100) : 0;

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', fontSize: '2.5rem' }}>
        Digital World: Complements vs. Replacements
      </h3>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
        Technology should enhance human interaction, not replace it.
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
              style={{ padding: '1.5rem 2.5rem', fontSize: '1.5rem', border: '2px solid var(--accent-primary)', textAlign: 'center' }}
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
          {totalVotes > 0 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '6px', background: '#fff', opacity: 0.8, width: `${helpfulPercent}%`, transition: 'width 0.3s' }} />
          )}
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => currentItem && handleSort(currentItem, 'harmful')}
          style={{ flex: 1, padding: '1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        >
          Harmful Replacement
          {totalVotes > 0 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '6px', background: '#fff', opacity: 0.8, width: `${harmfulPercent}%`, transition: 'width 0.3s' }} />
          )}
        </motion.button>
      </div>
      
      {totalVotes > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Complement: {helpfulVotes} ({helpfulPercent}%)</span>
          <span>•</span>
          <span style={{ color: '#f87171', fontWeight: 'bold' }}>Replacement: {harmfulVotes} ({harmfulPercent}%)</span>
        </motion.div>
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

      {/* Sorted lists overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <h4 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Helpful Complements ({helpfulItems.length})</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem' }}>
            {helpfulItems.map(item => (
              <li key={item.id} style={{ marginBottom: '0.5rem' }}>✓ {item.text}</li>
            ))}
          </ul>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <h4 style={{ color: '#f87171', marginBottom: '1rem' }}>Harmful Replacements ({harmfulItems.length})</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem' }}>
            {harmfulItems.map(item => (
              <li key={item.id} style={{ marginBottom: '0.5rem' }}>✗ {item.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DigitalSorting;
