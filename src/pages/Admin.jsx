import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Upload, Lock, ArrowLeft, FileText, RefreshCw, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  // Track which presentation is currently uploading a file
  const [uploadingFor, setUploadingFor] = useState(null);
  const fileInputRefs = useRef({});

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_password');
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) loadData();
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

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await apiCall('list');
      setPresentations(result.presentations || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      if (err.message === 'Unauthorized') {
        setAuthed(false);
        sessionStorage.removeItem('admin_password');
      }
    }
    setLoading(false);
  };

  const handleUpload = async (presentationId, file) => {
    if (!file) return;
    const filename = file.name;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      setUploadingFor(presentationId);
      try {
        const result = await apiCall('set-script', {
          presentationId,
          filename,
          content: base64,
        });
        setMessage({ type: 'success', text: result.message });
        await loadData();
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
      setUploadingFor(null);
      if (fileInputRefs.current[presentationId]) {
        fileInputRefs.current[presentationId].value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (presentationId, filename) => {
    if (!window.confirm(`Delete "${filename}" from "${presentationId}"? This removes it from the live site.`)) return;
    setLoading(true);
    try {
      const result = await apiCall('remove-script', { presentationId, filename });
      setMessage({ type: 'success', text: result.message });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setLoading(false);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload and manage scripts for each presentation.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadData}
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

        {/* Presentations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {presentations.length === 0 && (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No presentations found. Add entries to <code style={{ color: 'var(--accent-primary, #38bdf8)' }}>public/presentations.json</code>.
            </div>
          )}

          {presentations.map(pres => (
            <div key={pres.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              {/* Presentation header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={20} style={{ color: 'var(--accent-primary, #38bdf8)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{pres.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{pres.description}</p>
                </div>
              </div>

              {/* Script status */}
              {pres.scriptUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <FileText size={18} style={{ color: '#4ade80' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{pres.scriptName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Attached</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={pres.scriptUrl}
                      download={pres.scriptName}
                      style={{ padding: '0.45rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <FileText size={14} /> View
                    </a>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(pres.id, pres.scriptName)}
                      disabled={loading || uploadingFor === pres.id}
                      style={{ padding: '0.45rem 0.7rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Trash2 size={14} /> Delete
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px dashed var(--border-glass)', background: 'rgba(255,255,255,0.02)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  No script attached
                </div>
              )}

              {/* Upload/Replace button */}
              <input
                ref={el => fileInputRefs.current[pres.id] = el}
                type="file"
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files[0]) handleUpload(pres.id, e.target.files[0]);
                }}
              />
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => fileInputRefs.current[pres.id]?.click()}
                disabled={uploadingFor === pres.id || loading}
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  border: '1px solid var(--accent-primary, #38bdf8)',
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: 'var(--accent-primary, #38bdf8)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: uploadingFor === pres.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Upload size={18} />
                {uploadingFor === pres.id ? 'Uploading...' : pres.scriptUrl ? 'Replace Script' : 'Upload Script'}
              </motion.button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2rem', opacity: 0.6 }}>
          Changes commit directly to the GitHub repo — Vercel redeploys automatically.
        </p>
      </div>
    </div>
  );
};

export default Admin;
