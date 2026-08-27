import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, listenToVoting } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Sparkles, Check, Download, BookOpen, Radio } from 'lucide-react';
import { generateTakeawayPdf } from '../components/games/PdfTakeaway';

const Audience = () => {
  const [session, setSession] = useState(null);
  const [userVotes, setUserVotes] = useState({}); // Map of questionId -> votedOption
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToVoting('live_presentation', (data) => {
      setSession(data);
    });
    return () => unsubscribe();
  }, []);

  const currentQuestionId = session?.gameData?.questionId;
  const hasVotedCurrent = currentQuestionId ? Boolean(userVotes[currentQuestionId]) : false;
  const userVoteCurrent = currentQuestionId ? userVotes[currentQuestionId] : null;

  const handleVote = async (optionId) => {
    if (!currentQuestionId || hasVotedCurrent || submitting) return;

    setSubmitting(true);
    // Optimistic vote update locally
    setUserVotes(prev => ({ ...prev, [currentQuestionId]: optionId }));

    try {
      const ref = doc(db, 'sessions', 'live_presentation');
      await updateDoc(ref, {
        [`gameData.votes.${optionId}`]: increment(1)
      });
    } catch (e) {
      console.error('Error recording vote:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const votes = session?.gameData?.votes || {};
  const totalVotes = Object.values(votes).reduce((sum, v) => sum + (Number(v) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'white', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-primary, sans-serif)' }}>
      
      {/* Top Navigation Bar */}
      <header style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={22} style={{ color: 'var(--accent-primary, #38bdf8)' }} />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em' }}>EEPL PD SESSION</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Elizabeth Estates Public Library</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>
          <Radio size={14} className="animate-pulse" /> LIVE
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.5rem', maxWidth: 500, margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="wait">

          {/* State 1: General Presentation Slide / Waiting for Poll */}
          {(!session?.activeGame || session.activeGame === 'takeaway' || session.gameData?.isComplete) && (
            <motion.div 
              key="waiting"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              style={{ textAlign: 'center', padding: '2rem 1rem' }}
            >
              <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Sparkles size={32} style={{ color: 'var(--accent-primary, #38bdf8)' }} />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2 }}>
                {session?.slideTitle || "Building Strong Foundations"}
              </h2>
              
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '2rem' }}>
                {session?.slideSubtitle || "Literacy as the Heart of Early Learning"}
              </p>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
                  {session?.activeGame === 'takeaway' ? (
                    "Thank you for attending today's Professional Development session!"
                  ) : (
                    "Look at the projector screen. Interactive polls and quizzes will automatically appear on your phone."
                  )}
                </p>
              </div>

              {/* Takeaway PDF Download Button on phone */}
              {session?.activeGame === 'takeaway' && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={generateTakeawayPdf}
                  style={{ width: '100%', padding: '1.2rem', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #0284c7, #6366f1)', color: 'white', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)' }}
                >
                  <Download size={20} /> Download Reflection Guide (PDF)
                </motion.button>
              )}
            </motion.div>
          )}

          {/* State 2: Myth vs. Fact Activity */}
          {session?.activeGame === 'MythVsFact' && session.gameData && !session.gameData.isComplete && (
            <motion.div 
              key={`mvf-${currentQuestionId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', color: 'var(--accent-primary, #38bdf8)', fontWeight: 800 }}>
                  Statement {session.gameData.questionNumber || 1} of {session.gameData.totalQuestions || 4}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0 0' }}>Myth or Fact?</h2>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.75rem 1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.35rem', fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
                  "{session.gameData.questionText}"
                </p>
              </div>

              {hasVotedCurrent ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                    <Check size={20} /> Vote Recorded: {userVoteCurrent?.toUpperCase()}
                  </div>

                  {/* Live Results Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['fact', 'myth'].map((opt) => {
                      const count = Number(votes[opt]) || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      const isFact = opt === 'fact';
                      return (
                        <div key={opt} style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                            <span style={{ color: isFact ? '#34d399' : '#f87171' }}>{opt.toUpperCase()}</span>
                            <span>{count} votes ({percent}%)</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              style={{ height: '100%', background: isFact ? '#10b981' : '#ef4444' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '1.25rem', marginBottom: 0 }}>
                    Look at the projector screen for the explanation!
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote('fact')}
                    disabled={submitting}
                    style={{ flex: 1, padding: '1.5rem 1rem', borderRadius: '16px', border: 'none', background: '#10b981', color: 'white', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)' }}
                  >
                    FACT
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote('myth')}
                    disabled={submitting}
                    style={{ flex: 1, padding: '1.5rem 1rem', borderRadius: '16px', border: 'none', background: '#ef4444', color: 'white', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)' }}
                  >
                    MYTH
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* State 3: Digital World Sorting Activity */}
          {session?.activeGame === 'DigitalSorting' && session.gameData && !session.gameData.isComplete && (
            <motion.div 
              key={`sort-${currentQuestionId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', color: 'var(--accent-primary, #38bdf8)', fontWeight: 800 }}>
                  Habit {session.gameData.questionNumber || 1} of {session.gameData.totalQuestions || 4}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0 0' }}>Where does this habit belong?</h2>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.75rem 1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
                  "{session.gameData.questionText}"
                </p>
              </div>

              {hasVotedCurrent ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                    <Check size={20} /> Vote Recorded!
                  </div>

                  {/* Live Results Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { id: 'helpful', label: 'Helpful Complement', color: '#3b82f6' },
                      { id: 'harmful', label: 'Harmful Replacement', color: '#ef4444' }
                    ].map((opt) => {
                      const count = Number(votes[opt.id]) || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                            <span style={{ color: opt.color }}>{opt.label}</span>
                            <span>{count} votes ({percent}%)</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              style={{ height: '100%', background: opt.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '1.25rem', marginBottom: 0 }}>
                    Waiting for the presenter to sort on the main screen...
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleVote('helpful')}
                    disabled={submitting}
                    style={{ padding: '1.25rem', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', fontSize: '1.15rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)' }}
                  >
                    Helpful Complement
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleVote('harmful')}
                    disabled={submitting}
                    style={{ padding: '1.25rem', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', color: 'white', fontSize: '1.15rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(244, 63, 94, 0.3)' }}
                  >
                    Harmful Replacement
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* State 4: Scenario Quiz Activity */}
          {session?.activeGame === 'ScenarioQuiz' && session.gameData && !session.gameData.isComplete && (
            <motion.div 
              key={`scenario-${currentQuestionId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', color: 'var(--accent-primary, #38bdf8)', fontWeight: 800 }}>
                  Interactive Case Study
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0 0' }}>Classroom Scenario</h2>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.25rem', textAlign: 'left' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                  {session.gameData.questionText}
                </p>
              </div>

              {hasVotedCurrent ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                    <Check size={20} /> Option {userVoteCurrent?.toUpperCase()} Selected
                  </div>

                  {/* Live Results Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(session.gameData.options || []).map((opt) => {
                      const count = Number(votes[opt.id]) || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                            <span>Option {opt.id.toUpperCase()}</span>
                            <span>{count} votes ({percent}%)</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              style={{ height: '100%', background: 'var(--accent-primary, #38bdf8)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '1.25rem', marginBottom: 0 }}>
                    Look at the projector screen for the group discussion!
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(session.gameData.options || []).map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleVote(opt.id)}
                      disabled={submitting}
                      style={{ padding: '1rem 1.25rem', textAlign: 'left', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', lineHeight: 1.4, cursor: 'pointer', display: 'flex', gap: '0.75rem' }}
                    >
                      <span style={{ fontWeight: 800, color: 'var(--accent-primary, #38bdf8)' }}>{opt.id.toUpperCase()}.</span>
                      <span>{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* State 5: Prompt Builder Live Vote */}
          {session?.activeGame === 'PromptBuilder' && session.gameData?.activeVote && !session.gameData?.isComplete && (
            <motion.div
              key={`pb-${session.gameData.questionId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', color: 'var(--accent-primary, #38bdf8)', fontWeight: 800 }}>
                  Live Prompt Builder
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0 0' }}>
                  Vote on the {session.gameData.activeVote.field.charAt(0).toUpperCase() + session.gameData.activeVote.field.slice(1)}
                </h2>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  Help build the lesson prompt by choosing one of the options below.
                </p>
              </div>

              {hasVotedCurrent ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                    <Check size={20} /> Vote Recorded
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(session.gameData.activeVote.options || []).map((opt) => {
                      const count = Number(votes[opt.id]) || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                            <span>{opt.label}</span>
                            <span>{count} votes ({percent}%)</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              style={{ height: '100%', background: 'var(--accent-primary, #38bdf8)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '1.25rem', marginBottom: 0 }}>
                    The presenter will use the winning option on screen.
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(session.gameData.activeVote.options || []).map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleVote(opt.id)}
                      disabled={submitting}
                      style={{ padding: '1rem 1.25rem', textAlign: 'left', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', lineHeight: 1.4, cursor: 'pointer' }}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* State 6: Generic Live Poll */}
          {session?.activeGame === 'LivePoll' && session.gameData && !session.gameData.isComplete && (
            <motion.div
              key={`poll-${currentQuestionId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', color: 'var(--accent-primary, #38bdf8)', fontWeight: 800 }}>
                  Live Poll
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0 0' }}>
                  {session.gameData.question}
                </h2>
              </div>

              {hasVotedCurrent ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                    <Check size={20} /> Vote Recorded
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(session.gameData.options || []).map((opt) => {
                      const count = Number(votes[opt.id]) || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                            <span>{opt.label}</span>
                            <span>{count} votes ({percent}%)</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              style={{ height: '100%', background: opt.color || 'var(--accent-primary, #38bdf8)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '1.25rem', marginBottom: 0 }}>
                    Look at the projector screen to see the discussion.
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(session.gameData.options || []).map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleVote(opt.id)}
                      disabled={submitting}
                      style={{ padding: '1rem 1.25rem', textAlign: 'left', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', lineHeight: 1.4, cursor: 'pointer', borderLeft: `4px solid ${opt.color || '#38bdf8'}` }}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* State 7: AI or Human? */}
          {session?.activeGame === 'AiOrHuman' && session.gameData && !session.gameData.isComplete && (
            <motion.div
              key={`aoh-${currentQuestionId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', color: 'var(--accent-primary, #38bdf8)', fontWeight: 800 }}>
                  AI or Human?
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0 0' }}>
                  {session.gameData.questionText}
                </h2>
              </div>

              {hasVotedCurrent ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                    <Check size={20} /> You picked Option {userVoteCurrent?.toUpperCase()}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(session.gameData.options || []).map((opt) => {
                      const count = Number(votes[opt.id]) || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                            <span>{opt.label}</span>
                            <span>{count} votes ({percent}%)</span>
                          </div>
                          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              style={{ height: '100%', background: 'var(--accent-primary, #38bdf8)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '1.25rem', marginBottom: 0 }}>
                    Wait for the presenter to reveal the answer on the main screen.
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {(session.gameData.options || []).map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVote(opt.id)}
                      disabled={submitting}
                      style={{ flex: 1, padding: '1.5rem 1rem', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', fontSize: '1.3rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)' }}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* State 8: Emoji Reactions */}
          {session?.activeGame === 'EmojiReactions' && session.gameData && !session.gameData.isComplete && (
            <motion.div
              key={`emoji-${currentQuestionId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', color: 'var(--accent-primary, #38bdf8)', fontWeight: 800 }}>
                  Reaction Meter
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0.5rem 0 0', lineHeight: 1.4 }}>
                  {session.gameData.questionText}
                </h2>
              </div>

              {hasVotedCurrent ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                    <Check size={20} /> Reaction Recorded
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {(session.gameData.options || []).map((opt) => {
                      const count = Number(votes[opt.id]) || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} style={{ textAlign: 'center', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '1.6rem' }}>{opt.label.split(' ')[0]}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>{opt.label.split(' ').slice(1).join(' ')}</div>
                          <div style={{ fontSize: '0.85rem', color: opt.color || '#38bdf8', fontWeight: 700, marginTop: '0.25rem' }}>{count} ({percent}%)</div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {(session.gameData.options || []).map((opt) => (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVote(opt.id)}
                      disabled={submitting}
                      style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderLeft: `4px solid ${opt.color || '#38bdf8'}` }}
                    >
                      <span>{opt.label.split(' ')[0]}</span>
                      <span style={{ fontSize: '0.85rem' }}>{opt.label.split(' ').slice(1).join(' ')}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        Commonwealth of The Bahamas • Ministry of Education & Public Libraries
      </footer>
    </div>
  );
};

export default Audience;
