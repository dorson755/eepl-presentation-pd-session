import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Library, Download, FileText } from 'lucide-react';

// Maps icon names from presentations.json to lucide-react components
const ICONS = { BookOpen, FileText, Library };

const Gallery = () => {
  const [presentations, setPresentations] = useState([]);

  useEffect(() => {
    fetch('/presentations.json')
      .then(r => r.json())
      .then(data => setPresentations(data.presentations || []))
      .catch(() => setPresentations([]));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div
      className="gallery-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="gallery-header">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
          className="animate-float"
        >
          <Library className="card-icon" style={{ margin: '0 auto 1.5rem', width: 80, height: 80 }} />
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-gradient">Presentation Gallery</motion.h1>
        <motion.p variants={itemVariants}>A collection of interactive presentations designed to captivate and educate.</motion.p>
      </header>

      <motion.div className="presentation-grid" variants={itemVariants}>
        {presentations.map((pres) => {
          const Icon = ICONS[pres.icon] || BookOpen;
          return (
            <motion.div
              key={pres.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="glass-panel presentation-card hover-lift" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <motion.div
                  className="card-icon"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <Icon size={28} />
                </motion.div>
                <div className="card-content">
                  <h3 className="text-gradient-accent">{pres.title}</h3>
                  <p>{pres.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto', paddingTop: '1.5rem' }}>
                  <Link
                    to={pres.path}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid var(--accent-primary)',
                      transition: 'background 0.2s'
                    }}
                  >
                    Launch Presentation
                    <ChevronRight size={20} />
                  </Link>
                  {pres.scriptUrl && (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={pres.scriptUrl}
                      download={pres.scriptName}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                      title="Download accompanying script"
                    >
                      <Download size={18} />
                      Script
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Gallery;
