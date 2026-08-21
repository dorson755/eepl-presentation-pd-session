import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';

const PdfTakeaway = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const generatePDF = () => {
    setDownloading(true);
    
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Add Title
        doc.setFontSize(22);
        doc.setTextColor(15, 71, 97); // theme blue
        doc.text("Building Strong Foundations", 20, 30);
        
        doc.setFontSize(16);
        doc.setTextColor(89, 89, 89);
        doc.text("Literacy as the Heart of Early Learning", 20, 40);
        
        // Add divider
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(1);
        doc.line(20, 45, 190, 45);

        // Core Takeaways
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "bold");
        doc.text("Key Takeaways:", 20, 60);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        
        const bulletPoints = [
          "1. Literacy is more than reading words. It involves listening, speaking, reading, and writing.",
          "2. Every small effort matters. Every story, rhyme, and conversation builds the foundation.",
          "3. Books widen a child's world safely, showing them diverse cultures and families.",
          "4. The goal of the home-school partnership is connection, not burden.",
          "5. Digital literacy should complement human interaction, never replace it.",
          "6. A library is a literacy hub where curiosity is welcomed and community is built."
        ];
        
        let yPos = 70;
        bulletPoints.forEach(point => {
          // split text if too long
          const splitText = doc.splitTextToSize(point, 170);
          doc.text(splitText, 20, yPos);
          yPos += (splitText.length * 7) + 3;
        });
        
        // Quote
        doc.setFont("helvetica", "italic");
        doc.setTextColor(59, 130, 246);
        doc.text("\"Every mickle mek a muckle. Every little bit adds up to something great.\"", 20, yPos + 10);
        
        // Footer
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Darnell Lightbourne • Elizabeth Estates Public Library • Commonwealth of The Bahamas", 20, 280);

        doc.save('Literacy_Foundations_Takeaway.pdf');
        
        setDownloading(false);
        setDownloaded(true);
        
        setTimeout(() => setDownloaded(false), 5000);
      } catch (error) {
        console.error("Failed to generate PDF:", error);
        setDownloading(false);
      }
    }, 800); // Fake small delay for animation effect
  };

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Want to remember these points?</h3>
      <motion.button 
        className={`btn ${downloaded ? 'btn-glass' : 'btn-primary'}`}
        onClick={generatePDF}
        disabled={downloading || downloaded}
        whileHover={!downloading && !downloaded ? { scale: 1.05 } : {}}
        whileTap={!downloading && !downloaded ? { scale: 0.95 } : {}}
        style={{ display: 'flex', gap: '0.5rem', borderColor: downloaded ? '#34d399' : 'transparent' }}
      >
        {downloading ? (
          <span>Generating PDF...</span>
        ) : downloaded ? (
          <>
            <CheckCircle2 style={{ color: '#34d399' }} /> <span style={{ color: '#34d399' }}>Summary Downloaded</span>
          </>
        ) : (
          <>
            <Download /> Download 1-Page Summary
          </>
        )}
      </motion.button>
    </div>
  );
};

export default PdfTakeaway;
