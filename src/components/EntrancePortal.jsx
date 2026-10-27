import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatars';

export default function EntrancePortal({ onClose }) {
  const { login, quickLogin, demoPersonas } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (key) => {
    quickLogin(key);
    onClose();
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 1250 }}>
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '540px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0d233a 0%, #1e3a8a 100%)',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.12)', padding: '0.2rem 0.65rem', borderRadius: '15px', fontSize: '0.72rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            <i className="fa-solid fa-building-columns"></i>
            <span>Vignan University Academic Merit Portal</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800' }}>
            Skill<span style={{ color: '#60a5fa' }}>Swap</span> Platform
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: '#cbd5e1', fontSize: '0.82rem' }}>
            Cashless peer skill-swapping with AI dynamic 20-Q assessments (+3/-1/0)
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Demo 1-Click Login Section */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              ⚡ Instant 1-Click Demo Profiles (Password: Password123)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('sri')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <img src={getAvatarUrl('sri')} alt="Sri" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Sri Dhanush</div>
                  <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '600' }}>Python & AI Lead</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rishitha')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <img src={getAvatarUrl('rishitha')} alt="Rishitha" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Rishitha</div>
                  <div style={{ fontSize: '0.68rem', color: '#ec4899', fontWeight: '600' }}>UI/UX Figma Pro</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('bharath')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <img src={getAvatarUrl('bharath')} alt="Bharath" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Bharath</div>
                  <div style={{ fontSize: '0.68rem', color: '#3b82f6', fontWeight: '600' }}>Fullstack Senior</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <img src={getAvatarUrl('admin')} alt="Admin" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Dr. S. K. Rao</div>
                  <div style={{ fontSize: '0.68rem', color: '#8b5cf6', fontWeight: '600' }}>Faculty Admin</div>
                </div>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
            <span>or sign in with university email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                University Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sri@vignan.ac.in"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.82rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.82rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {errorMsg && (
              <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '0.55rem', borderRadius: '8px', fontSize: '0.78rem' }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #0d233a, #1e3a8a)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                marginTop: '0.5rem',
                boxShadow: '0 4px 12px rgba(13, 35, 58, 0.25)'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
