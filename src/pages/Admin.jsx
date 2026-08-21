import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Upload, Lock, ArrowLeft, FileText, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_password');
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) loadScripts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const apiCall = async (action, data = {}) => {
    const response = await fetch('/api/manage-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({ action, ...data }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password) {
      sessionStorage.setItem('admin_password', password);
      setAuthed(true);
    }
  };

  const loadScripts = async () => {
    setLoading(true);
    try {
      const result = await apiCall('list');
      setScripts(result.scripts || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      if (err.message === 'Unauthorized') {
        setAuthed(false);
        sessionStorage.removeItem('admin_password');
      }
    }
    setLoading(false);
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete ${filename}? This removes it from the live site immediately.`)) return;
    setLoading(true);
    try {
      const result = await apiCall('delete', { filename });
      setMessage({ type: 'success', text: result.message });
      await loadScripts();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    const filename = uploadName || uploadFile.name;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      setLoading(true);
      try {
        const result = await apiCall('upload', { filename, content: base64 });
        setMessage({ type: 'success', text: result.message });
        setUploadFile(null);
        setUploadName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadScripts();
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
      setLoading(false);
    };
    reader.readAsDataURL(uploadFile);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // --- Login screen ---
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-panel"
          style={{ padding: '3rem', maxWidth: 400, width: '100%' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Lock size={28} style={{ color: 'var(--accent-primary, #38bdf8)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Script Manager</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter your admin password to manage presentation scripts.</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', marginBottom: '1.5rem', fontSize: '1rem' }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!password}
              style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', border: 'none', background: password ? 'linear-gradient(135deg, #0284c7, #6366f1)' : 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', fontWeight: 700, cursor: password ? 'pointer' : 'not-allowed' }}
            >
              Unlock
            </motion.button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to gallery</a>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Admin panel ---
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'white', padding: '2rem 1.5rem', fontFamily: 'var(--font-primary, sans-serif)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Script Manager</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload, delete, and replace presentation scripts.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadScripts}
              disabled={loading}
              style={{ padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </motion.button>
            <a
              href="/"
              style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={18} /> Gallery
            </a>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                ...(message.type === 'success'
                  ? { background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80' }
                  : { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' })
              }}
            >
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload section */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={20} style={{ color: 'var(--accent-primary, #38bdf8)' }} /> Upload New Script
          </h3>
          <form onSubmit={handleUpload}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={e => setUploadFile(e.target.files[0])}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Filename (optional)</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  placeholder={uploadFile ? uploadFile.name : "uses original name"}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: uploadFile ? 1.02 : 1 }}
              whileTap={{ scale: uploadFile ? 0.98 : 1 }}
              type="submit"
              disabled={!uploadFile || loading}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: 'none', background: uploadFile ? 'linear-gradient(135deg, #0284c7, #6366f1)' : 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: uploadFile ? 'pointer' : 'not-allowed' }}
            >
              {loading ? 'Uploading...' : 'Upload Script'}
            </motion.button>
          </form>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: 0 }}>
            Max 1 MB. Uploading with an existing filename replaces it. After upload, update <code style={{ color: 'var(--accent-primary, #38bdf8)' }}>scriptUrl</code> in Gallery.jsx if the name changed.
          </p>
        </div>

        {/* Scripts list */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: 'var(--accent-primary, #38bdf8)' }} /> Current Scripts
          </h3>
          {scripts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No scripts uploaded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {scripts.map(script => (
                <div
                  key={script.sha}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{script.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatSize(script.size)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={`/scripts/${script.name}`}
                      download={script.name}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      title="Download"
                    >
                      <FileText size={15} /> View
                    </a>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(script.name)}
                      disabled={loading}
                      style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      title="Delete"
                    >
                      <Trash2 size={15} /> Delete
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2rem', opacity: 0.6 }}>
          Changes commit directly to the GitHub repo — Vercel redeploys automatically.
        </p>
      </div>
    </div>
  );
};

export default Admin;
