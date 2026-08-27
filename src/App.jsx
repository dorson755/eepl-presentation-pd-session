import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Gallery from './pages/Gallery';
import PdSession from './presentations/PdSession/PdSession';
import AiInEducation from './presentations/AiInEducation/AiInEducation';
import Audience from './pages/Audience';
import Admin from './pages/Admin';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/presentation/pd-session" element={<PdSession />} />
        <Route path="/presentation/ai-in-education" element={<AiInEducation />} />
        <Route path="/audience" element={<Audience />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Analytics />
    </div>
  );
}

export default App;
