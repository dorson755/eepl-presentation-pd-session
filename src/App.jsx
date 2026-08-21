import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Gallery from './pages/Gallery';
import PdSession from './presentations/PdSession/PdSession';
import Audience from './pages/Audience';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/presentation/pd-session" element={<PdSession />} />
        <Route path="/audience" element={<Audience />} />
      </Routes>
    </div>
  );
}

export default App;
