import React, { useEffect, useRef, useState } from 'react';
import { Deck, Slide, Appear, Notes } from 'spectacle';
import { motion } from 'framer-motion';

// Interactive Components
import LiteracyMatchingGame from '../../components/games/LiteracyMatchingGame';
import ScenarioQuiz from '../../components/games/ScenarioQuiz';
import BookReveal from '../../components/games/BookReveal';
import MythVsFact from '../../components/games/MythVsFact';
import DigitalSorting from '../../components/games/DigitalSorting';
import PdfTakeaway from '../../components/games/PdfTakeaway';
import ThreeBackground from '../../components/ThreeBackground';
import AILibrarian from '../../components/games/AILibrarian';
import QRCode from 'react-qr-code';
import { updateSessionState } from '../../firebase';

const SLIDE_INFO = [
  { index: 0, title: "Building Strong Foundations", subtitle: "Literacy as the Heart of Early Learning", activeGame: null },
  { index: 1, title: "Every Mickle Mek a Muckle", subtitle: "Small moments in a classroom become lifelong habits.", activeGame: null },
  { index: 2, title: "Myth vs. Fact", subtitle: "Interactive Audience Quiz", activeGame: "MythVsFact" },
  { index: 3, title: "Whole-Child Literacy", subtitle: "Listening, Speaking, Reading, Writing", activeGame: null },
  { index: 4, title: "The Teacher's Responsibility", subtitle: "Read with expression • Invite questions • Make reading everyday", activeGame: null },
  { index: 5, title: "Expanding a Child's World", subtitle: "A child's world starts small. Books lovingly widen it.", activeGame: null },
  { index: 6, title: "Classroom Scenario", subtitle: "Interactive Problem Solving", activeGame: "ScenarioQuiz" },
  { index: 7, title: "The Digital World", subtitle: "Complements vs. Replacements", activeGame: "DigitalSorting" },
  { index: 8, title: "Recommended Bahamian Books", subtitle: "Curated Library Collection", activeGame: null },
  { index: 9, title: "Closing & Reflections", subtitle: "Every mickle mek a muckle", activeGame: "takeaway" }
];

const SlideSync = ({ slideNumber = 1, numberOfSlides = 10 }) => {
  const lastSlideRef = useRef(null);

  useEffect(() => {
    if (slideNumber === lastSlideRef.current) return;
    lastSlideRef.current = slideNumber;

    // Spectacle passes slideNumber as 1-based (activeView.slideIndex + 1),
    // so convert to a 0-based index for SLIDE_INFO lookup.
    const slideIndex = slideNumber - 1;
    const info = SLIDE_INFO[slideIndex] || {
      index: slideIndex,
      title: `Slide ${slideNumber}`,
      subtitle: "Live Presentation",
      activeGame: null
    };

    // ALWAYS update basic session info so Audience knows the active game
    updateSessionState('live_presentation', {
      slideIndex: slideIndex,
      slideTitle: info.title,
      slideSubtitle: info.subtitle,
      activeGame: info.activeGame,
      // If not a game (or takeaway), clear the gameData
      ...(info.activeGame && info.activeGame !== 'takeaway' ? {} : { gameData: null })
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

const PdSession = () => {
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
      <div className="presentation-overlay" />
      <AILibrarian />
      <div className="presentation-stage">
        <Deck
          theme={theme}
          transition={{ type: 'fade', duration: 0.6 }}
          backgroundColor="transparent"
          suppressBackdropFallback
          template={({ slideNumber, numberOfSlides }) => (
          <SlideSync slideNumber={slideNumber} numberOfSlides={numberOfSlides} />
        )}
      >
        
        {/* Slide 1: Title Slide */}
        <Slide>
          <div style={slideContainerStyle}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, type: 'spring' }}>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-primary)', fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                Professional Development Session
              </p>
              <h1 className="text-gradient" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                Building Strong Foundations:<br/>Literacy as the Heart of Early Learning
              </h1>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>
                  For Preschool Teachers and Early Childhood Educators
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
                Darnell Lightbourne • Elizabeth Estates Public Library • Commonwealth of The Bahamas
              </p>
            </motion.div>
          </div>
          <Notes>
            Good morning everyone. Protocol having been established... 
            Introduce self and role. Set the central theme exactly: literacy as the heart of early learning.
          </Notes>
        </Slide>

        {/* Slide 2: Every mickle mek a muckle */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient-accent" style={{ fontSize: '4rem', fontStyle: 'italic', marginBottom: '2rem' }}>
              "Every mickle mek a muckle."
            </h2>
            <Appear>
              <p style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
                Every little bit adds up to something great.
              </p>
            </Appear>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginTop: '4rem', textAlign: 'left', width: '90%' }}>
              <div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <Appear><li style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1.5rem', fontSize: '1.4rem' }}>One more story read.</li></Appear>
                  <Appear><li style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1.5rem', fontSize: '1.4rem' }}>One more rhyme sung.</li></Appear>
                  <Appear><li style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1.5rem', fontSize: '1.4rem' }}>One more question answered.</li></Appear>
                </ul>
              </div>
              <Appear>
                <motion.div className="glass-panel" style={{ padding: '2.5rem' }} whileHover={{ scale: 1.02 }}>
                  <p style={{ fontSize: '1.4rem', lineHeight: 1.6 }}><strong>Small moments</strong> in a classroom become lifelong habits in a child.</p>
                </motion.div>
              </Appear>
            </div>
          </div>
        </Slide>

        {/* Slide 3: Myth vs Fact Game */}
        <Slide>
          <div style={slideContainerStyle}>
            <MythVsFact />
          </div>
        </Slide>

        {/* Slide 4: Interactive Literacy Matching */}
        <Slide>
          <div style={slideContainerStyle}>
            <LiteracyMatchingGame />
          </div>
          <Notes>
            Push back against the narrow definition of literacy.
            This is whole-child development.
          </Notes>
        </Slide>

        {/* Slide 5: Teacher's Responsibility */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '4rem' }}>
              The Teacher's Responsibility
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', textAlign: 'left', width: '90%' }}>
              <div style={{ fontSize: '1.6rem' }}>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>🎙️</span> Read with expression.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>🤔</span> Invite predictions and questions.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>🎭</span> Use pictures, rhymes, puppets, and retelling.</p></Appear>
                <Appear><p style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}><span style={{ marginRight: '1rem', fontSize: '2rem' }}>📚</span> Make reading part of everyday life.</p></Appear>
              </div>
              <Appear>
                <div className="glass-panel" style={{ padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: '1.8rem', lineHeight: 1.6, textAlign: 'center' }}>These are not small techniques.<br/><br/><span className="text-gradient-accent" style={{ fontWeight: 800 }}>They are powerful acts of literacy building.</span></p>
                </div>
              </Appear>
            </div>
          </div>
        </Slide>

        {/* Slide 6: Expanding a Child's World */}
        <Slide>
          <div style={slideContainerStyle}>
            <h2 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '3rem' }}>
              Expanding a Child's World Through Books
            </h2>
            <div className="glass-panel hover-lift" style={{ padding: '4rem', maxWidth: '900px', width: '100%' }}>
              <Appear>
                <p style={{ fontSize: '2.2rem', fontStyle: 'italic', marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
                  "Everybody born in The Bahamas."
                </p>
              </Appear>
              <Appear>
                <p style={{ fontSize: '2.2rem', marginBottom: '2.5rem' }}>
                  "What? I didn't know that!"
                </p>
              </Appear>
              <Appear>
                <div style={{ width: '80px', height: '4px', background: 'var(--accent-primary)', margin: '0 auto 2.5rem', borderRadius: '2px' }} />
                <p style={{ fontSize: '2rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  A child's world starts small. Books lovingly widen it.
                </p>
              </Appear>
            </div>
          </div>
        </Slide>

        {/* Slide 7: Interactive Scenario */}
        <Slide>
          <div style={slideContainerStyle}>
            <ScenarioQuiz />
          </div>
        </Slide>

        {/* Slide 8: Digital World */}
        <Slide>
          <div style={slideContainerStyle}>
            <DigitalSorting />
          </div>
        </Slide>

        {/* Slide 9: Interactive Book Reveal */}
        <Slide>
          <div style={slideContainerStyle}>
            <BookReveal />
          </div>
        </Slide>

        {/* Slide 10: Closing */}
        <Slide>
          <div style={slideContainerStyle}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              transition={{ duration: 1, type: 'spring' }}
              style={{ textAlign: 'center' }}
            >
              <p style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Every page turned.</p>
              <p style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Every story shared.</p>
              <p style={{ fontSize: '2.5rem', marginBottom: '4rem', color: 'var(--text-secondary)' }}>Every child encouraged.</p>
              
              <h2 className="text-gradient-accent" style={{ fontSize: '5rem', marginBottom: '3rem' }}>
                Every mickle mek a muckle.
              </h2>
              
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}>
                <p style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginTop: '2rem' }}>
                  Thank you for the work you do every day.
                </p>
              </motion.div>
              
              <Appear>
                <PdfTakeaway />
              </Appear>
            </motion.div>
          </div>
        </Slide>

      </Deck>
      </div>
    </div>
  );
};

export default PdSession;
