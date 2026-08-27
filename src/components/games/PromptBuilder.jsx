import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react';


const EXAMPLE_TOPICS = ['Photosynthesis', 'The Water Cycle', 'Fractions', 'World War II', 'Parts of Speech'];
const EXAMPLE_GRADES = ['Grade 4', 'Grade 6', 'Grade 8', 'Grade 10'];
const EXAMPLE_CONSTRAINTS = [
  'Mixed reading levels, 30 minutes, only paper and board work',
  'No devices, 20 minutes, outdoor space available',
  'Large class of 35, 45 minutes, needs pair work',
  'English language learners, 40 minutes, visual supports needed'
];

const MOCK_RESPONSES = {
  'Photosynthesis': `🌱 30-Minute Grade 6 Photosynthesis Lesson

Warm-up (5 min): Show a wilted plant and a healthy plant. Ask: "What does one have that the other might need?"

Pair activity (20 min): Each pair gets a simple diagram. They label: roots, stem, leaves, sunlight, water, air. Then they write a one-paragraph explanation as if teaching a Grade 4 student.

Exit ticket (3 questions):
1. What three things do plants need to make their own food?
2. Why are leaves important in photosynthesis?
3. Name one thing that would happen to a plant without sunlight.`,
  'The Water Cycle': `💧 30-Minute Grade 6 Water Cycle Lesson

Warm-up (5 min): Draw a large water drop on the board. Ask students where they have seen water "disappear" in real life.

Pair activity (20 min): Students create a mini water-cycle storyboard using only paper and pencil: evaporation, condensation, precipitation, collection. Each stage gets a simple caption.

Exit ticket (3 questions):
1. What causes water to evaporate?
2. What happens during condensation?
3. Why does the water cycle never "run out" of water?`,
  'Fractions': `🍕 30-Minute Grade 6 Fractions Lesson

Warm-up (5 min): Fold a paper strip into halves, thirds, and fourths. Ask students to name the fractions they see.

Pair activity (20 min): Each pair gets a "pizza" circle and must split toppings equally among 2, 3, and 4 people. They write the fraction each person receives and compare which is bigger.

Exit ticket (3 questions):
1. What fraction of a pizza does each person get if it is shared by 4 people?
2. Which is larger: 1/3 or 1/4? Explain with a drawing.
3. If you have 2/5 of a chocolate bar and get another 1/5, how much do you have now?`,
  'World War II': `🕊️ 30-Minute Grade 6 World War II Lesson

Warm-up (5 min): Display a world map. Ask students to locate Europe and the Pacific, then predict why a war might involve so many countries.

Pair activity (20 min): Each pair receives a short profile of a child from the era (evacuee, factory worker, resistance helper). They read it together and write a 5-sentence diary entry from that child's perspective.

Exit ticket (3 questions):
1. Name two reasons World War II involved many countries.
2. How did the war affect ordinary children?
3. Why is it important to learn about this period today?`,
  'Parts of Speech': `✏️ 30-Minute Grade 6 Parts of Speech Lesson

Warm-up (5 min): Write a funny sentence on the board. Students come up and label nouns, verbs, adjectives, and adverbs with colored markers.

Pair activity (20 min): Pairs write a 6-sentence "mad lib" story, leaving blanks for specific parts of speech. They swap with another pair to fill in the blanks and read aloud.

Exit ticket (3 questions):
1. What is the job of a verb in a sentence?
2. Give an example of an adjective from today's activity.
3. How does changing one adverb change the meaning of a sentence?`
};

const PromptBuilder = () => {
  const [topic, setTopic] = useState('Photosynthesis');
  const [grade, setGrade] = useState('Grade 6');
  const [constraint, setConstraint] = useState(EXAMPLE_CONSTRAINTS[0]);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const builtPrompt = `Create a 30-minute ${grade} lesson on ${topic} for ${constraint.toLowerCase()}, with one warm-up, one pair activity, and a 3-question exit ticket.`;

  const handleGenerate = () => {
    setGenerated(true);
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

  const mockResponse = MOCK_RESPONSES[topic] || MOCK_RESPONSES['Photosynthesis'];

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: 950, margin: '0 auto' }}>
      <h3 className="text-gradient-accent" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.2rem' }}>
        Live Challenge: Build a Useful Prompt
      </h3>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Pick a topic, grade, and constraint. Then watch a practical prompt take shape.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setGenerated(false); }}
            onFocus={() => setActiveField('topic')}
            onBlur={() => setActiveField(null)}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-glass-light)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <AnimatePresence>
            {activeField === 'topic' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, marginTop: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '12px', overflow: 'hidden' }}
              >
                {EXAMPLE_TOPICS.map((t) => (
                  <button
                    key={t}
                    onMouseDown={(e) => { e.preventDefault(); setTopic(t); setGenerated(false); setActiveField(null); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.85rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-glass-light)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {t}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Grade</label>
          <select
            value={grade}
            onChange={(e) => { setGrade(e.target.value); setGenerated(false); }}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-glass-light)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {EXAMPLE_GRADES.map((g) => <option key={g} value={g} style={{ background: 'var(--bg-secondary)' }}>{g}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Constraint</label>
          <select
            value={constraint}
            onChange={(e) => { setConstraint(e.target.value); setGenerated(false); }}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-glass-light)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {EXAMPLE_CONSTRAINTS.map((c) => <option key={c} value={c} style={{ background: 'var(--bg-secondary)' }}>{c}</option>)}
          </select>
        </div>
      </div>

      <motion.div
        layout
        className="glass-panel"
        style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.25)', textAlign: 'left', position: 'relative' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.6, margin: 0, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
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

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: generated ? '1.5rem' : 0 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Sparkles size={20} />
          {generated ? 'Regenerate Idea' : 'Generate Lesson Idea'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setTopic(EXAMPLE_TOPICS[Math.floor(Math.random() * EXAMPLE_TOPICS.length)]); setGenerated(false); }}
          className="btn btn-glass"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={18} />
          Randomize
        </motion.button>
      </div>

      <AnimatePresence>
        {generated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left', borderLeft: '4px solid var(--accent-primary)', background: 'rgba(59, 130, 246, 0.08)' }}>
              <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>AI-Generated Lesson Idea</h4>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-primary)', fontSize: '1rem', lineHeight: 1.6, margin: 0, color: 'var(--text-primary)' }}>
                {mockResponse}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptBuilder;
