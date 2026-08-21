import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, ChevronRight, Library } from 'lucide-react';

const Gallery = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
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
        <motion.p variants={itemVariants}>A collection of interactive, God-Tier presentations designed to captivate and educate.</motion.p>
      </header>

      <motion.div className="presentation-grid" variants={itemVariants}>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link to="/presentation/pd-session" className="glass-panel presentation-card hover-lift">
            <motion.div 
              className="card-icon"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <BookOpen size={28} />
            </motion.div>
            <div className="card-content">
              <h3 className="text-gradient-accent">Professional Development Session</h3>
              <p>Building Strong Foundations: Literacy as the Heart of Early Learning</p>
            </div>
            <motion.div 
              style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-primary)', marginTop: 'auto', paddingTop: '1.5rem', fontWeight: 600 }}
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              Launch Presentation 
              <motion.div variants={{ rest: { x: 0 }, hover: { x: 5 } }}>
                <ChevronRight size={20} style={{ marginLeft: 6 }} />
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Gallery;
