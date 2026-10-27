import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, onOpenQuiz, onOpenWallet, onOpenCert, onOpenDoubts }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.isAdmin;

  const menuItems = [
    { id: 'explore', label: 'Explore Tutors', icon: 'fa-solid fa-compass' },
    { id: 'sessions', label: 'My Sessions', icon: 'fa-solid fa-calendar-check' },
    { id: 'quiz', label: 'AI 20-Q Exam (+3/-1)', icon: 'fa-solid fa-brain', action: onOpenQuiz },
    { id: 'wallet', label: 'Wallet & Escrow', icon: 'fa-solid fa-wallet', action: onOpenWallet },
    { id: 'certificates', label: 'DocVerify Forensics', icon: 'fa-solid fa-file-shield', action: onOpenCert },
    { id: 'doubts', label: 'Peer Doubt Forum', icon: 'fa-solid fa-circle-question', action: onOpenDoubts },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Moderation', icon: 'fa-solid fa-shield-halved' });
  }

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--sidebar-bg, #161922)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem 0.75rem',
      flexShrink: 0,
      minHeight: 'calc(100vh - 70px)',
      boxSizing: 'border-box'
    }}>
      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <div style={{
          fontSize: '0.68rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#64748b',
          padding: '0.5rem 0.75rem',
          fontWeight: '700'
        }}>
          Knowledge Exchange
        </div>

        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActiveTab(item.id);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#222736' : 'transparent',
                color: isActive ? '#ffffff' : '#9ca3af',
                fontSize: '0.85rem',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <i className={item.icon} style={{ width: '18px', color: isActive ? '#60a5fa' : '#64748b' }}></i>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 4-Tier Tutor Merit Badge Guide */}
      <div style={{
        backgroundColor: '#1e2330',
        borderRadius: '12px',
        padding: '0.85rem',
        border: '1px solid #232738',
        marginTop: '1rem'
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#f8fafc', marginBottom: '0.5rem' }}>
          4-Tier Classification Rates
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.7rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span>🥉 Bronze Tutor</span>
            <span style={{ fontWeight: '700', color: '#f59e0b' }}>1.0 Cr/hr</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span>🥈 Silver Tutor</span>
            <span style={{ fontWeight: '700', color: '#38bdf8' }}>1.5 Cr/hr</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span>🎖️ Advanced Tutor</span>
            <span style={{ fontWeight: '700', color: '#818cf8' }}>2.0 Cr/hr</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span>🥇 Elite Master</span>
            <span style={{ fontWeight: '700', color: '#34d399' }}>2.5 Cr/hr</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
