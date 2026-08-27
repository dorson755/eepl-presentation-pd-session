import React, { useEffect, useContext } from 'react';
import { useLiveAudience } from '../../utils/useLiveAudience';
import { SlideContext } from 'spectacle';

const REACTIONS = [
  { id: 'fire', emoji: '🔥', label: 'Excited', color: '#f59e0b' },
  { id: 'think', emoji: '🤔', label: 'Skeptical', color: '#3b82f6' },
  { id: 'mindblown', emoji: '🤯', label: 'Mind blown', color: '#8b5cf6' },
  { id: 'clap', emoji: '👏', label: 'Makes sense', color: '#10b981' }
];

const EmojiReactions = ({ statement, prompt }) => {
  const { isSlideActive } = useContext(SlideContext);
  const { votes, publishState } = useLiveAudience('EmojiReactions');

  useEffect(() => {
    if (isSlideActive) {
      publishState({
        questionId: `emoji-${statement?.slice(0, 20) || 'reaction'}`,
        questionText: prompt || 'How do you react?',
        options: REACTIONS.map((r) => ({ id: r.id, label: `${r.emoji} ${r.label}`, color: r.color })),
        votes: {}
      });
    }
  }, [isSlideActive, statement, prompt, publishState]);

  const totalVotes = Object.values(votes || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', width: '100%', maxWidth: 700, margin: '1.5rem auto 0' }}>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>
        {prompt || 'Tap a reaction:'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {REACTIONS.map((r) => {
          const count = Number(votes?.[r.id]) || 0;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          return (
            <div key={r.id} style={{ position: 'relative', padding: '1rem 0.5rem', borderRadius: '12px', background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass)', textAlign: 'center', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${percent}%`, background: `${r.color}22`, transition: 'height 0.4s ease' }} />
              <div style={{ position: 'relative', fontSize: '2rem' }}>{r.emoji}</div>
              <div style={{ position: 'relative', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{r.label}</div>
              <div style={{ position: 'relative', fontSize: '0.85rem', color: r.color, fontWeight: 700, marginTop: '0.25rem' }}>{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmojiReactions;
