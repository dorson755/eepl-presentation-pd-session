import React, { useEffect, useContext } from 'react';
import { useLiveAudience } from '../../utils/useLiveAudience';
import { SlideContext } from 'spectacle';

const LivePoll = ({ questionId, question, options, title = 'Live Poll' }) => {
  const { isSlideActive } = useContext(SlideContext);
  const { votes, publishState } = useLiveAudience('LivePoll');

  useEffect(() => {
    if (isSlideActive) {
      publishState({
        questionId,
        question,
        options,
        votes: {}
      });
    }
  }, [isSlideActive, questionId, question, options, publishState]);

  const totalVotes = Object.values(votes || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>
        {title}
      </h3>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.3rem' }}>
        {question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {options.map((opt) => {
          const count = Number(votes?.[opt.id]) || 0;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          return (
            <div key={opt.id} style={{ position: 'relative', padding: '1rem 1.25rem', borderRadius: '12px', background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percent}%`, background: `${opt.color}33`, transition: 'width 0.4s ease' }} />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{count} votes ({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1.5rem', fontSize: '1rem' }}>
        Audience can vote on their devices. Results update live.
      </p>
    </div>
  );
};

export default LivePoll;
