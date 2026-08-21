import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_KIMI_API_KEY,
  baseURL: 'https://api.moonshot.cn/v1',
  dangerouslyAllowBrowser: true
});

const AILibrarian = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am the EEPL AI Librarian. Ask me anything about early childhood literacy." }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "moonshot-v1-8k",
        messages: [
          { role: 'system', content: 'You are an AI Librarian for the Elizabeth Estates Public Library in The Bahamas. You are assisting Darnell Lightbourne during a Professional Development Session for preschool teachers. Your core philosophy is "Every mickle mek a muckle" (every small act adds up). Emphasize that literacy is whole-child development (listening, speaking, reading, writing). Keep responses concise (under 3 sentences), warm, and encouraging. Use British/Bahamian spelling where appropriate.' },
          ...newMessages
        ]
      });
      
      setMessages([...newMessages, { role: 'assistant', content: response.choices[0].message.content }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my archives right now. (API Error)" }]);
    }
    setLoading(false);
  };

  return (
    <>
      <motion.button
        className="glass-panel"
        style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1000, color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}
        whileHover={{ scale: 1.1, boxShadow: '0 0 20px var(--accent-glow)' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass-panel"
            style={{ position: 'fixed', bottom: '6rem', right: '2rem', width: 400, height: 500, display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', border: '1px solid var(--border-light)' }}
          >
            <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                <Sparkles size={20} className="text-gradient-accent" /> EEPL AI Librarian
              </h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-glass-light)', padding: '1rem', borderRadius: '12px', borderBottomRightRadius: msg.role === 'user' ? 0 : '12px', borderBottomLeftRadius: msg.role === 'assistant' ? 0 : '12px', color: msg.role === 'user' ? '#fff' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>Thinking...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 1rem', cursor: 'pointer' }}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AILibrarian;
