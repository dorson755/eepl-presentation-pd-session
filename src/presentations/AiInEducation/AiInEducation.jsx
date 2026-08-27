import React, { useEffect, useRef, useState } from 'react';
import { Deck, Slide, Appear, Notes } from 'spectacle';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';

import PromptBuilder from '../../components/games/PromptBuilder';
import ThreeBackground from '../../components/ThreeBackground';
import { updateSessionState } from '../../firebase';

const SLIDE_INFO = [
  { index: 0, title: "AI in Education: Closer Than People Think", subtitle: "Opening", activeGame: null },
  { index: 1, title: "Why AI Still Feels Distant", subtitle: "The perception problem", activeGame: null },
  { index: 2, title: "Accessibility Means In-Reach", subtitle: "Redefining access", activeGame: null },
  { index: 3, title: "When Tech Sounds Deeper Than It Is", subtitle: "Pseudo-profundity", activeGame: null },
  { index: 4, title: "AI Is Already in Teachers' Hands", subtitle: "Real classroom use", activeGame: null },
  { index: 5, title: "What AI Actually Gives Teachers", subtitle: "Assistant, partner, tutor", activeGame: null },
  { index: 6, title: "Live Challenge: Let's Build Something Useful", subtitle: "Interactive prompt demo", activeGame: "PromptBuilder" },
  { index: 7, title: "Where Do I Actually Go to Use AI?", subtitle: "Tools and entry points", activeGame: null },
  { index: 8, title: "From Lesson to Experience", subtitle: "Gamification and amplification", activeGame: null },
  { index: 9, title: "AI Can Also Improve Learner Access", subtitle: "Accessibility for learners", activeGame: null },
  { index: 10, title: "Use It, But Use It Wisely", subtitle: "Guardrails and judgment", activeGame: null },
  { index: 11, title: "The Best Time to Start Is Small", subtitle: "Closing", activeGame: null }
];

const SlideSync = ({ slideNumber = 1, numberOfSlides = 11 }) => {
  const lastSlideRef = useRef(null);

  useEffect(() => {
    if (slideNumber === lastSlideRef.current) return;
    lastSlideRef.current = slideNumber;

    const slideIndex = slideNumber - 1;
    const info = SLIDE_INFO[slideIndex] || {
      index: slideIndex,
      title: `Slide ${slideNumber}`,
      subtitle: "Live Presentation",
      activeGame: null
    };

    updateSessionState('live_presentation', {
      slideIndex: slideIndex,
      slideTitle: info.title,
      slideSubtitle: info.subtitle,
      activeGame: info.activeGame,
      ...(info.activeGame ? {} : { gameData: null })
    });
  }, [slideNumber]);

  const progress = (slideNumber / numberOfSlides) * 100;
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', background: 'rgba(255,255,255,0.05)', zIndex: 100 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ height: '100%', background: 'var(--accent-primary)', boxShadow: '0 0 15px var(--accent-glow)' }}
      />
    </div>
  );
};

const theme = {
  colors: {
    primary: 'var(--text-primary)',
    secondary: 'var(--accent-primary)',
    tertiary: 'transparent',
    quaternary: 'transparent',
    quinary: 'transparent'
  },
  fonts: {
    header: 'var(--font-display)',
    text: 'var(--font-primary)'
  },
  backdropStyle: {
    background: 'transparent'
  }
};

const slideContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  padding: '2rem',
  textAlign: 'center',
  position: 'relative',
  zIndex: 10
};

const AiInEducation = () => {
  const [shortLink, setShortLink] = useState('');

  useEffect(() => {
    fetch('/api/short-link')
      .then(r => r.json())
      .then(data => setShortLink(data.shortUrl || ''))
      .catch(() => {});
  }, []);

  return (
    <div className="presentation-wrapper theme-presentation">
      <ThreeBackground />
      <Deck
        theme={theme}
        transition={{ type: 'fade', duration: 0.6 }}
        backgroundColor="transparent"
        suppressBackdropFallback
        template={({ slideNumber, numberOfSlides }) => (
          <SlideSync slideNumber={slideNumber} numberOfSlides={numberOfSlides} />
        )}
      >

        {/* Slide 1: Title */}
        <Slide>
          <div style={slideContainerStyle}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, type: 'spring' }}>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-primary)', fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                AI in Education
              </p>
              <h1 className="text-gradient" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                AI in Education:<br/>Closer Than People Think
              </h1>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
                  Practical, within reach, and already useful in real classrooms.
                </p>
              </motion.div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 }} style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginTop: '2.5rem' }}>
                <QRCode value={`${window.location.protocol}//${window.location.host}/audience`} size={120} />
                <p style={{ color: 'black', margin: '0.5rem 0 0', fontWeight: 'bold', fontSize: '0.95rem' }}>Scan to Join Live Polling</p>
                <p style={{ color: '#666', margin: '0.4rem 0 0', fontSize: '0.85rem' }}>or visit:</p>
                <p style={{ color: '#0f4761', margin: '0.2rem 0 0', fontWeight: 'bold', fontSize: '1rem', fontFamily: 'monospace' }}>{shortLink || 'Loading…'}</p>
              </motion.div>

              <div style={{ width: '60px', height: '4px', background: 'var(--accent-primary)', margin: '1.5rem auto', borderRadius: '2px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', opacity: 0.7 }}>
                For Teachers and Educators
              </p>
            </motion.div>
          </div>
          <Notes>
            Today is not about making AI sound impressive. It is about making it usable.
            The central claim: AI is already within reach for ordinary teachers.
          </Notes>
        </Slide>

        {/* Slide 2: Perception Problem */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient-accent" style={{ fontSize: '3.8rem', marginBottom: '3rem' }}>
              Why AI Still Feels Distant
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '90%', textAlign: 'left' }}>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2rem' }}>
                  <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>Sounds too technical</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>The language around AI often sounds like it belongs in an engineering lab, not a staff room.</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2rem' }}>
                  <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>Feels like a specialist tool</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>It is often introduced as if only tech-savvy teachers or administrators can use it well.</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2rem' }}>
                  <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>Comes with hype, not help</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Too many introductions promise revolution but skip the Monday-morning usefulness.</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2rem' }}>
                  <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>Seems like a private club</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>The conversation can feel as if AI is reserved for insiders with special access or status.</p>
                </div>
              </Appear>
            </div>
          </div>
          <Notes>
            Validate the hesitation. The intimidation is real, but much of it is created by the way AI is discussed, not by the actual difficulty of starting.
          </Notes>
        </Slide>

        {/* Slide 3: Accessibility as In-Reach */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient" style={{ fontSize: '3.8rem', marginBottom: '1rem' }}>
              (the other) Accessibility
            </h2>
            <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 3rem' }}>
              AI is near enough, simple enough, and available enough for ordinary educators to begin using now.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', width: '95%' }}>
              <Appear>
                <div className="glass-panel" style={{ padding: '2rem 1.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚫</div>
                  <p style={{ fontSize: '1.2rem' }}>You do not need to be a programmer.</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel" style={{ padding: '2rem 1.5rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚫</div>
                  <p style={{ fontSize: '1.2rem' }}>You do not need special insider access.</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel" style={{ padding: '2rem 1.5rem', borderColor: 'var(--accent-primary)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
                  <p style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: 700 }}>You need a device, a clear need, and a better question.</p>
                </div>
              </Appear>
            </div>
            <Appear>
              <motion.div className="glass-panel" style={{ marginTop: '3rem', padding: '2rem', maxWidth: '900px' }} whileHover={{ scale: 1.01 }}>
                <p style={{ fontSize: '1.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  "AI is one of the few powerful tools that does not first ask who you know — it asks what you want help with."
                </p>
              </motion.div>
            </Appear>
          </div>
          <Notes>
            This is the key framing slide. The social point: AI is not gated by connections or credentials. It responds to clear thinking and clear need.
          </Notes>
        </Slide>

        {/* Slide 4: Pseudo-Profundity */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient-accent" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
              When Tech Sounds Deeper Than It Is
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', marginBottom: '2.5rem' }}>
              If it sounds deep but does not help a teacher on Monday morning, it may just be jargon pretending to be wisdom.
            </p>
            <div style={{ width: '90%', maxWidth: '1000px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <div>Sounds Profound</div>
                <div>Actually Useful</div>
              </div>
              <Appear>
                <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', marginBottom: '1rem', alignItems: 'center', textAlign: 'left' }}>
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"Leverage advanced multimodal systems."</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Create a quiz with three difficulty levels.</div>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', marginBottom: '1rem', alignItems: 'center', textAlign: 'left' }}>
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"Deploy intelligent learning architectures."</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Rewrite this explanation for Grade 4.</div>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', alignItems: 'center', textAlign: 'left' }}>
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"Harness adaptive pedagogical automation."</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Turn this topic into a class game.</div>
                </div>
              </Appear>
            </div>
          </div>
          <Notes>
            Help the audience laugh and relax. The point: fancy language is often a performance. Useful language solves a real classroom problem.
          </Notes>
        </Slide>

        {/* Slide 5: Teachers Already Using It */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient" style={{ fontSize: '3.8rem', marginBottom: '1rem' }}>
              AI Is Already in Teachers' Hands
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
              This is not a futuristic idea. It is already part of real teaching workflows.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', width: '90%' }}>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2.5rem 2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Lesson Planning</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Teachers are using AI to draft lessons, sequence activities, and plan assessments.</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2.5rem 2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖨️</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Classroom Materials</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Worksheets, rubrics, summaries, examples, and visual supports are being generated and adapted.</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2.5rem 2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Communication</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Emails to parents, progress notes, and differentiated explanations are being drafted faster.</p>
                </div>
              </Appear>
            </div>
            <Appear>
              <div className="glass-panel" style={{ marginTop: '3rem', padding: '1.5rem 2.5rem', maxWidth: '900px' }}>
                <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>RAND research:</strong> In the 2023–2024 school year, roughly one-quarter of surveyed U.S. teachers used AI tools for instructional planning or teaching.
                </p>
              </div>
            </Appear>
          </div>
          <Notes>
            Move from theory to proof. The point is not saturation; it is that AI has moved beyond hype into real workflows.
          </Notes>
        </Slide>

        {/* Slide 6: What AI Gives Teachers */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient-accent" style={{ fontSize: '3.8rem', marginBottom: '0.5rem' }}>
              What AI Actually Gives Teachers
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', marginBottom: '3rem' }}>
              Think of AI less as a replacement and more as a fast, flexible support tool.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', width: '92%' }}>
              <Appear>
                <motion.div className="glass-panel hover-lift" style={{ padding: '2.5rem 2rem', height: '100%' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧑‍💼</div>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Assistant</h3>
                  <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                    <li>• Drafts lesson materials</li>
                    <li>• Creates rubrics and quizzes</li>
                    <li>• Produces summaries and examples</li>
                  </ul>
                </motion.div>
              </Appear>
              <Appear>
                <motion.div className="glass-panel hover-lift" style={{ padding: '2.5rem 2rem', height: '100%' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Partner</h3>
                  <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                    <li>• Helps brainstorm activities</li>
                    <li>• Suggests alternate explanations</li>
                    <li>• Supports differentiation ideas</li>
                  </ul>
                </motion.div>
              </Appear>
              <Appear>
                <motion.div className="glass-panel hover-lift" style={{ padding: '2.5rem 2rem', height: '100%' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Tutor</h3>
                  <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                    <li>• Generates practice questions</li>
                    <li>• Offers multiple explanations</li>
                    <li>• Helps create review and feedback prompts</li>
                  </ul>
                </motion.div>
              </Appear>
            </div>
          </div>
          <Notes>
            Align with OECD framing of AI as tutor, partner, and assistant. Emphasize practical value over magical replacement.
          </Notes>
        </Slide>

        {/* Slide 7: Interactive Live Demo */}
        <Slide>
          <div style={{ ...slideContainerStyle, padding: '1.5rem' }}>
            <PromptBuilder />
          </div>
          <Notes>
            Let's stop talking about AI like it is a mystery and use it the way a busy teacher would.
            Invite the room to contribute a topic, grade, and constraint. Show that effective AI use depends more on clear prompting than technical knowledge.
          </Notes>
        </Slide>

        {/* Slide 8: Tools Teachers Can Use */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient" style={{ fontSize: '3.6rem', marginBottom: '0.5rem' }}>
              Where Do I Actually Go to Use AI?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', marginBottom: '2.5rem', maxWidth: '850px' }}>
              The skill transfers. Start with whatever you already have access to.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', width: '92%' }}>
              <Appear>
                <motion.div className="glass-panel hover-lift" style={{ padding: '2rem 1.5rem', height: '100%', textAlign: 'left' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>General Chat Assistants</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem' }}>ChatGPT, Claude, Gemini, Copilot</p>
                  <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    <li>• Draft lesson plans</li>
                    <li>• Rewrite explanations</li>
                    <li>• Brainstorm activities</li>
                    <li>• Generate practice questions</li>
                  </ul>
                </motion.div>
              </Appear>
              <Appear>
                <motion.div className="glass-panel hover-lift" style={{ padding: '2rem 1.5rem', height: '100%', textAlign: 'left' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍎</div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>Teaching-Focused Tools</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem' }}>MagicSchool, Eduaide, Diffit, Curipod</p>
                  <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    <li>• Built-in lesson templates</li>
                    <li>• Differentiation helpers</li>
                    <li>• Rubric and quiz generators</li>
                    <li>• Standards alignment support</li>
                  </ul>
                </motion.div>
              </Appear>
              <Appear>
                <motion.div className="glass-panel hover-lift" style={{ padding: '2rem 1.5rem', height: '100%', textAlign: 'left' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>Tools Already in Your Workflow</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem' }}>Google Docs, Microsoft Word, Canva</p>
                  <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    <li>• Built-in AI writing help</li>
                    <li>• Slide and worksheet makers</li>
                    <li>• Grammar and clarity checks</li>
                    <li>• No new login required</li>
                  </ul>
                </motion.div>
              </Appear>
            </div>
            <Appear>
              <div className="glass-panel" style={{ marginTop: '2.5rem', padding: '1.5rem 2.5rem', maxWidth: '900px' }}>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>The tool matters less than the ask.</strong> A clear, specific prompt in a basic chat assistant will usually beat a vague prompt in a fancy teaching tool.
                </p>
              </div>
            </Appear>
          </div>
          <Notes>
            Reassure the audience that they do not need to learn every tool. The prompting skill transfers. Recommend starting with whatever is already available or approved in their school.
          </Notes>
        </Slide>

        {/* Slide 9: Gamification and Amplification */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient" style={{ fontSize: '3.8rem', marginBottom: '0.5rem' }}>
              From Lesson to Experience
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', marginBottom: '3rem', maxWidth: '800px' }}>
              AI does not just save time. It can amplify and gamify lessons.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '90%', textAlign: 'left' }}>
              <div>
                <Appear><p style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1.5rem', fontSize: '1.5rem' }}>Turn a worksheet into a team challenge.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1.5rem', fontSize: '1.5rem' }}>Turn a topic into a quest, debate, or mystery.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1.5rem', fontSize: '1.5rem' }}>Generate roles, clues, levels, points, and reflection questions.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1.5rem', fontSize: '1.5rem' }}>Multiply one lesson idea into several classroom products.</p></Appear>
              </div>
              <Appear>
                <motion.div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }} whileHover={{ scale: 1.01 }}>
                  <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    "Turn this Grade 5 history topic into a 15-minute classroom quest with teams, clues, points, and a final reflection."
                  </p>
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    One solid prompt can become a quiz, a game, a roleplay, a revision task, and a differentiated resource set.
                  </p>
                </motion.div>
              </Appear>
            </div>
          </div>
          <Notes>
            Show AI as creativity and engagement amplifier, not just productivity tool.
          </Notes>
        </Slide>

        {/* Slide 9: Accessibility for Learners */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient-accent" style={{ fontSize: '3.8rem', marginBottom: '1rem' }}>
              AI Can Also Improve Learner Access
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', maxWidth: '850px', margin: '0 auto 3rem' }}>
              The first meaning of accessibility was AI being in reach for teachers. It can also support inclusion and access for students.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', width: '95%' }}>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
                  <p style={{ fontSize: '1.1rem' }}>Simplify explanations</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📖</div>
                  <p style={{ fontSize: '1.1rem' }}>Adjust reading level</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔄</div>
                  <p style={{ fontSize: '1.1rem' }}>Offer alternative examples</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌐</div>
                  <p style={{ fontSize: '1.1rem' }}>Support varied language needs</p>
                </div>
              </Appear>
              <Appear>
                <div className="glass-panel hover-lift" style={{ padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛤️</div>
                  <p style={{ fontSize: '1.1rem' }}>Create multiple paths into the same concept</p>
                </div>
              </Appear>
            </div>
            <Appear>
              <p style={{ marginTop: '3rem', color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '800px' }}>
                Used carefully and ethically, AI can help teachers broaden access to lesson content for more learners.
              </p>
            </Appear>
          </div>
          <Notes>
            Bring back the second meaning of accessibility. AI can support inclusion when used responsibly.
          </Notes>
        </Slide>

        {/* Slide 10: Guardrails and Judgment */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient" style={{ fontSize: '3.8rem', marginBottom: '1rem' }}>
              Use It, But Use It Wisely
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
              Practical AI use and responsible AI use belong together.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '85%', textAlign: 'left' }}>
              <div>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>🔍</span> Verify outputs.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>🔒</span> Protect student privacy.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>🧑‍🏫</span> Keep the teacher in control.</p></Appear>
              </div>
              <div>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>🧠</span> Do not outsource judgment.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>🛡️</span> Use AI to assist, not replace thinking.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>⚖️</span> Follow ethical, human-centred guidance.</p></Appear>
              </div>
            </div>
            <Appear>
              <div className="glass-panel" style={{ marginTop: '3rem', padding: '1.5rem 2.5rem', maxWidth: '900px' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                  UNESCO emphasizes human-centred use, ethical safeguards, and the protection of learners and educators.
                </p>
              </div>
            </Appear>
          </div>
          <Notes>
            Keep the presentation balanced. AI is powerful but not beyond scrutiny. Human judgment remains essential.
          </Notes>
        </Slide>

        {/* Slide 11: Closing */}
        <Slide>
          <div style={slideContainerStyle}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ duration: 1, type: 'spring' }} style={{ textAlign: 'center' }}>
              <h2 className="text-gradient-accent" style={{ fontSize: '4rem', marginBottom: '2rem' }}>
                The Best Time to Start Is Small
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
                <motion.div className="glass-panel" style={{ padding: '2rem 2.5rem' }} whileHover={{ scale: 1.05 }}>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>One task</p>
                </motion.div>
                <motion.div className="glass-panel" style={{ padding: '2rem 2.5rem' }} whileHover={{ scale: 1.05 }}>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>One prompt</p>
                </motion.div>
                <motion.div className="glass-panel" style={{ padding: '2rem 2.5rem' }} whileHover={{ scale: 1.05 }}>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>One lesson</p>
                </motion.div>
              </div>
              <motion.div className="glass-panel" style={{ padding: '2rem', maxWidth: '850px', margin: '0 auto 2.5rem' }}>
                <p style={{ fontSize: '1.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "The goal is not to become an AI expert overnight. The goal is to become a better-equipped teacher."
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}>
                <p style={{ color: 'var(--text-primary)', fontSize: '1.6rem', marginBottom: '1rem' }}>
                  AI is not reserved for the connected, the technical, or the intimidating.
                </p>
                <p style={{ color: 'var(--accent-primary)', fontSize: '1.8rem', fontWeight: 700 }}>
                  In education, it becomes powerful in the hands of ordinary teachers doing practical work well.
                </p>
              </motion.div>
            </motion.div>
          </div>
          <Notes>
            Close with empowerment. Teachers do not need to become AI experts overnight. Start with one real classroom need and let confidence grow through use.
          </Notes>
        </Slide>

      </Deck>
    </div>
  );
};

export default AiInEducation;
