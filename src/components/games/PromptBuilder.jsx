import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Copy, Check, Download, Gamepad2, Vote, Eye, EyeOff, Accessibility, GraduationCap, Lightbulb, Wand2 } from 'lucide-react';
import { useLiveAudience } from '../../utils/useLiveAudience';

const EXAMPLE_TOPICS = ['Photosynthesis', 'The Water Cycle', 'Fractions', 'World War II', 'Parts of Speech'];
const EXAMPLE_GRADES = ['Grade 4', 'Grade 6', 'Grade 8', 'Grade 10'];
const EXAMPLE_CONSTRAINTS = [
  'Mixed reading levels, 30 minutes, only paper and board work',
  'No devices, 20 minutes, outdoor space available',
  'Large class of 35, 45 minutes, needs pair work',
  'English language learners, 40 minutes, visual supports needed'
];

const VOTE_OPTIONS = {
  topic: EXAMPLE_TOPICS.slice(0, 3),
  grade: EXAMPLE_GRADES,
  constraint: EXAMPLE_CONSTRAINTS.slice(0, 3)
};

const MODES = {
  lesson: { label: 'Lesson Plan', icon: Sparkles, color: '#3b82f6' },
  gamify: { label: 'Gamified Version', icon: Gamepad2, color: '#8b5cf6' },
  simplify: { label: 'Simplified Reading Level', icon: Accessibility, color: '#10b981' },
  ell: { label: 'English Language Learners', icon: GraduationCap, color: '#f59e0b' },
  extend: { label: 'Extension Activity', icon: Lightbulb, color: '#ec4899' }
};

const PromptBuilder = () => {
  const { votes, publishState } = useLiveAudience('PromptBuilder');

  const [topic, setTopic] = useState('Photosynthesis');
  const [grade, setGrade] = useState('Grade 6');
  const [constraint, setConstraint] = useState(EXAMPLE_CONSTRAINTS[0]);
  const [generated, setGenerated] = useState(false);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [showAnatomy, setShowAnatomy] = useState(false);
  const [mode, setMode] = useState('lesson');
  const [activeVote, setActiveVote] = useState(null);

  const builtPrompt = `Create a 30-minute ${grade} lesson on ${topic} for ${constraint.toLowerCase()}, with one warm-up, one pair activity, and a 3-question exit ticket.`;

  const generate = async (generationMode = mode) => {
    setLoading(true);
    setGenerated(true);
    setResponse('');
    setMode(generationMode);

    try {
      const res = await fetch('/api/prompt-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: builtPrompt, mode: generationMode })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setResponse(`⚠️ ${errData.error || `Error ${res.status}`}`);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullText += parsed.content;
              setResponse(fullText);
            }
          } catch {
            // ignore incomplete JSON
          }
        }
      }
    } catch {
      setResponse('⚠️ Could not reach the AI service. Please try again.');
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(builtPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([`Prompt:\n${builtPrompt}\n\n${MODES[mode].label}:\n${response}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-lesson-${topic.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startVote = (field) => {
    const options = VOTE_OPTIONS[field].map((label, idx) => ({ id: `${field}-${idx}`, label }));
    const voteData = { field, options, votes: {} };
    setActiveVote(voteData);
    publishState({
      questionId: `pb-${field}`,
      activeVote: voteData,
      votes: {}
    });
  };

  const applyWinner = () => {
    if (!activeVote || !votes) return;
    const winner = activeVote.options.reduce((max, opt) => {
      const count = Number(votes[opt.id]) || 0;
      return count > max.count ? { option: opt, count } : max;
    }, { option: activeVote.options[0], count: -1 }).option;

    if (activeVote.field === 'topic') setTopic(winner.label);
    if (activeVote.field === 'grade') setGrade(winner.label);
    if (activeVote.field === 'constraint') setConstraint(winner.label);

    setActiveVote(null);
    publishState({ activeVote: null, votes: {} });
  };

  const cancelVote = () => {
    setActiveVote(null);
    publishState({ questionId: null, activeVote: null, votes: {} });
  };

  const anatomyParts = [
    { label: 'Task', text: `Create a 30-minute lesson`, color: '#3b82f6' },
    { label: 'Audience', text: `for ${grade}`, color: '#8b5cf6' },
    { label: 'Topic', text: `on ${topic}`, color: '#10b981' },
    { label: 'Constraints', text: `for ${constraint.toLowerCase()}`, color: '#f59e0b' },
    { label: 'Format', text: `with one warm-up, one pair activity, and a 3-question exit ticket`, color: '#ec4899' }
  ];

  const voteTotal = activeVote && votes ? Object.values(votes).reduce((sum, v) => sum + (Number(v) || 0), 0) : 0;

  return (
    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: 1000, maxHeight: '88vh', overflowY: 'auto', margin: '0 auto' }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>
        Live Challenge: Build Something Useful
      </h3>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Pick a topic, grade, and constraint. Then watch a practical prompt take shape.
      </p>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {[
          { label: 'Topic', value: topic, setter: setTopic, field: 'topic', options: EXAMPLE_TOPICS },
          { label: 'Grade', value: grade, setter: setGrade, field: 'grade', options: EXAMPLE_GRADES },
          { label: 'Constraint', value: constraint, setter: setConstraint, field: 'constraint', options: EXAMPLE_CONSTRAINTS }
        ].map(({ label, value, setter, field, options }) => (
          <div key={field} style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={value}
                onChange={(e) => { setter(e.target.value); setGenerated(false); }}
                onFocus={() => setActiveField(field)}
                onBlur={() => setActiveField(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-glass-light)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startVote(field)}
                disabled={activeVote !== null}
                title={`Ask audience to vote on ${label.toLowerCase()}`}
                style={{ padding: '0 0.7rem', borderRadius: '10px', border: '1px solid var(--border-glass)', background: activeVote?.field === field ? 'var(--accent-primary)' : 'var(--bg-glass-light)', color: 'white', cursor: activeVote ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Vote size={18} />
              </motion.button>
            </div>
            <AnimatePresence>
              {activeField === field && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, marginTop: '0.4rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '10px', overflow: 'hidden' }}
                >
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onMouseDown={(e) => { e.preventDefault(); setter(opt); setGenerated(false); setActiveField(null); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.55rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-glass-light)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Active Vote Panel */}
      <AnimatePresence>
        {activeVote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel"
            style={{ marginBottom: '1rem', padding: '1rem', borderLeft: '4px solid var(--accent-primary)', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>Audience Vote: {activeVote.field.charAt(0).toUpperCase() + activeVote.field.slice(1)}</h4>
              <button onClick={cancelVote} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {activeVote.options.map((opt) => {
                const count = Number(votes?.[opt.id]) || 0;
                const percent = voteTotal > 0 ? Math.round((count / voteTotal) * 100) : 0;
                return (
                  <div key={opt.id} style={{ position: 'relative', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'var(--bg-glass-light)', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percent}%`, background: 'rgba(59, 130, 246, 0.25)', transition: 'width 0.3s' }} />
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>{opt.label}</span>
                      <span>{count} votes ({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={applyWinner}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
            >
              Apply Winner
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt Anatomy Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAnatomy(!showAnatomy)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass)', borderRadius: '20px', padding: '0.4rem 0.9rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          {showAnatomy ? <EyeOff size={16} /> : <Eye size={16} />}
          {showAnatomy ? 'Hide prompt anatomy' : 'Show prompt anatomy'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAnatomy && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '1rem', overflow: 'hidden' }}
          >
            <div className="glass-panel" style={{ padding: '1rem', textAlign: 'left' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Each color shows a different part of a clear prompt:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', fontSize: '1rem', lineHeight: 1.6 }}>
                {anatomyParts.map((part, idx) => (
                  <React.Fragment key={part.label}>
                    <span title={part.label} style={{ background: `${part.color}22`, border: `1px solid ${part.color}55`, borderRadius: '6px', padding: '0.2rem 0.5rem', color: part.color }}>{part.text}</span>
                    {idx < anatomyParts.length - 1 && <span style={{ color: 'var(--text-secondary)' }}>,</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Built Prompt */}
      <motion.div
        layout
        className="glass-panel"
        style={{ padding: '1.25rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.25)', textAlign: 'left', position: 'relative' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, margin: 0, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
            {builtPrompt}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            title="Copy prompt"
            style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
          >
            {copied ? <Check size={18} style={{ color: '#34d399' }} /> : <Copy size={18} />}
            <span style={{ fontSize: '0.8rem' }}>{copied ? 'Copied' : 'Copy'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: generated ? '1rem' : 0, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => generate('lesson')}
          disabled={loading}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Sparkles size={18} />
          {generated ? 'Regenerate Lesson' : 'Generate Lesson'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setTopic(EXAMPLE_TOPICS[Math.floor(Math.random() * EXAMPLE_TOPICS.length)]); setGenerated(false); }}
          className="btn btn-glass"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={16} />
          Randomize
        </motion.button>
      </div>

      {/* Mode Buttons */}
      <AnimatePresence>
        {generated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {Object.entries(MODES).map(([key, { label, icon: Icon, color }]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => generate(key)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid var(--border-glass)',
                    background: mode === key ? `${color}33` : 'var(--bg-glass-light)',
                    color: mode === key ? color : 'var(--text-secondary)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <Icon size={16} />
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Response */}
      <AnimatePresence>
        {generated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <GeneratedResponse mode={mode} response={response} loading={loading} onDownload={handleDownload} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GeneratedResponse = ({ mode, response, loading, onDownload }) => {
  const ModeIcon = MODES[mode].icon;
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response]);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'left', borderLeft: `4px solid ${MODES[mode].color}`, background: `${MODES[mode].color}11` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ color: MODES[mode].color, margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ModeIcon size={20} />
          {MODES[mode].label}
        </h4>
        {response && !loading && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownload}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.4rem 0.7rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            <Download size={16} />
            Download
          </motion.button>
        )}
      </div>
      {loading && !response && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          <Wand2 size={18} className="animate-pulse" /> Building your lesson idea...
        </div>
      )}
      <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-primary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, color: 'var(--text-primary)' }}>
          {response}
        </pre>
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default PromptBuilder;
