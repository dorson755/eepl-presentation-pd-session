import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveAudience } from '../../utils/useLiveAudience';
import { SlideContext } from 'spectacle';
import { Brain, User } from 'lucide-react';

const ROUNDS = [
  {
    id: 'aoh-1',
    a: {
      label: 'Option A',
      text: `Grade 6 Photosynthesis Lesson (20 minutes)

Warm-up: Show students a wilted plant and a healthy plant. Ask: "What does one plant have that the other might need?"

Main activity: In pairs, students label a simple diagram with roots, stem, leaves, sunlight, water, and air. They write one paragraph explaining photosynthesis as if teaching a younger student.

Exit ticket: Name three things plants need to make food.`,
      isAi: true
    },
    b: {
      label: 'Option B',
      text: `Grade 6 Photosynthesis Lesson

Begin by asking students to share what they know about plants. Show a video clip. Have students take notes. Assign textbook pages 45–47. Collect notes at the end of class.`,
      isAi: false
    }
  },
  {
    id: 'aoh-2',
    a: {
      label: 'Option A',
      text: `Fractions Review

Review numerator and denominator. Complete worksheet #12. Check answers together. Homework: worksheet #13.`,
      isAi: false
    },
    b: {
      label: 'Option B',
      text: `Fractions Pizza Party

Each pair gets a paper "pizza" circle. Challenge them to split toppings equally among 2, 3, and 4 people. They write the fraction each person receives and draw which slice is bigger: 1/3 or 1/4.`,
      isAi: true
    }
  }
];

const AiOrHuman = () => {
  const { isSlideActive } = useContext(SlideContext);
  const { votes, publishState } = useLiveAudience('AiOrHuman');
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const round = ROUNDS[roundIndex];

  useEffect(() => {
    if (isSlideActive) {
      publishState({
        questionId: round.id,
        questionText: `Round ${roundIndex + 1}: Which lesson plan was written by AI?`,
        options: [
          { id: 'a', label: 'Option A' },
          { id: 'b', label: 'Option B' }
        ],
        votes: {}
      });
    }
  }, [isSlideActive, roundIndex, round.id, publishState]);

  const totalVotes = Object.values(votes || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const aVotes = Number(votes?.a) || 0;
  const bVotes = Number(votes?.b) || 0;
  const aPercent = totalVotes > 0 ? Math.round((aVotes / totalVotes) * 100) : 0;
  const bPercent = totalVotes > 0 ? Math.round((bVotes / totalVotes) * 100) : 0;

  const handleReveal = () => setRevealed(true);
  const nextRound = () => {
    setRevealed(false);
    setRoundIndex((i) => (i + 1) % ROUNDS.length);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>
        AI or Human?
      </h3>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Round {roundIndex + 1} of {ROUNDS.length}: Which lesson plan was written by AI?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'a', data: round.a, votes: aVotes, percent: aPercent, icon: aVotes > bVotes ? '👑' : null },
          { key: 'b', data: round.b, votes: bVotes, percent: bPercent, icon: bVotes > aVotes ? '👑' : null }
        ].map(({ key, data, votes: count, percent, icon }) => (
          <motion.div
            key={key}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              textAlign: 'left',
              borderLeft: revealed ? `4px solid ${data.isAi ? '#8b5cf6' : '#10b981'}` : '4px solid var(--border-glass)',
              background: revealed ? (data.isAi ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)') : 'var(--bg-glass-light)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.3rem' }}>{data.label}</h4>
              {icon && <span style={{ fontSize: '1.5rem' }}>{icon}</span>}
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-primary)', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)', margin: 0 }}>
              {data.text}
            </pre>

            {totalVotes > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} style={{ height: '100%', background: 'var(--accent-primary)' }} />
                </div>
                <p style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{count} votes ({percent}%)</p>
              </div>
            )}

            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '10px', background: data.isAi ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {data.isAi ? <Brain size={20} style={{ color: '#8b5cf6' }} /> : <User size={20} style={{ color: '#10b981' }} />}
                  <span style={{ fontWeight: 700, color: data.isAi ? '#8b5cf6' : '#10b981' }}>
                    {data.isAi ? 'Written by AI' : 'Written by a teacher'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {!revealed ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReveal}
            className="btn btn-primary"
          >
            Reveal Answer
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextRound}
            className="btn btn-glass"
          >
            Next Round
          </motion.button>
        )}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1.25rem', fontSize: '0.95rem' }}>
        Audience votes on their phones. The point: clear prompting can produce work that looks surprisingly human.
      </p>
    </div>
  );
};

export default AiOrHuman;
