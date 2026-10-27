import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatars';

export default function Navbar({ onOpenPortal, onOpenWallet, onOpenQuiz, searchQuery, setSearchQuery }) {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="main-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.75rem',
      backgroundColor: 'var(--bg-card, #ffffff)',
      borderBottom: '1px solid var(--border-subtle, #eaedf5)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.04))'
    }}>
      {/* Brand & University Crest */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0d233a, #1e3a8a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(13, 35, 58, 0.25)'
        }}>
          <i className="fa-solid fa-graduation-cap"></i>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Skill<span style={{ color: '#3b82f6' }}>Swap</span>
            </span>
            <span style={{
              background: '#e0e7ff',
              color: '#3730a3',
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '0.15rem 0.45rem',
              borderRadius: '20px',
              textTransform: 'uppercase'
            }}>
              React Edition
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Vignan University Merit Platform
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{ flex: '1', maxWidth: '440px', margin: '0 1.5rem', position: 'relative' }}>
        <i className="fa-solid fa-magnifying-glass" style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}></i>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tutors, skills (Python, UI/UX, React, DSA)..."
          style={{
            width: '100%',
            padding: '0.6rem 1rem 0.6rem 2.5rem',
            borderRadius: '10px',
            border: '1px solid var(--border-medium, #d9e2ec)',
            backgroundColor: 'var(--bg-subtle, #f0f3f8)',
            fontSize: '0.85rem',
            outline: 'none',
            color: 'var(--text-primary)',
            transition: 'border-color 0.2s'
          }}
        />
      </div>

      {/* Action Badges & User Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {isAuthenticated ? (
          <>
            {/* Take Assessment Button */}
            <button
              onClick={onOpenQuiz}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
            >
              <i className="fa-solid fa-bolt"></i>
              <span>AI Quiz (+3/-1)</span>
            </button>

            {/* Wallet Credits Pill */}
            <button
              onClick={onOpenWallet}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#065f46',
                borderRadius: '20px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              title="Click to view Wallet & Smart Escrow contracts"
            >
              <i className="fa-solid fa-coins" style={{ color: '#059669' }}></i>
              <span>{user?.credits?.toFixed(1) || '0.0'} Cr</span>
            </button>

            {/* User Profile Info & Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img
                src={getAvatarUrl(user?.id)}
                alt={user?.name}
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #3b82f6' }}
              />
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '600' }}>
                  {user?.role === 'ADMIN' ? 'Faculty Admin' : 'Verified Tutor'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Switch User / Logout"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  fontSize: '0.9rem'
                }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onOpenPortal}
            style={{
              background: '#0d233a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 1.1rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}
