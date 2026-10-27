import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatars';

export default function SessionsView({ onJoinMeet }) {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([
    {
      id: 'sess_1',
      tutorName: 'Rishitha',
      tutorId: 'rishitha',
      topic: 'Figma Auto-Layout & Design Tokens for React SPAs',
      date: 'Today, 05:00 PM',
      duration: '1 Hour',
      credits: 2.5,
      status: 'Ready to Join',
      roomId: 'skillswap_meet_sess_1'
    },
    {
      id: 'sess_2',
      tutorName: 'Bharath',
      tutorId: 'bharath',
      topic: 'Building Production Express REST APIs & JWT Security',
      date: 'Tomorrow, 02:00 PM',
      duration: '2 Hours',
      credits: 5.0,
      status: 'Upcoming',
      roomId: 'skillswap_meet_sess_2'
    },
    {
      id: 'sess_3',
      tutorName: 'Pujitha',
      tutorId: 'pujitha',
      topic: 'PostgreSQL Relational Schema Normalization & Query Optimization',
      date: 'Completed Yesterday',
      duration: '1 Hour',
      credits: 2.0,
      status: 'Completed',
      roomId: 'skillswap_meet_sess_3'
    }
  ]);

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          My Peer Mentorship Sessions
        </h2>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Join live 1-on-1 WebRTC video sessions, review mentors, and manage your escrow contracts.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sessions.map(s => {
          const isReady = s.status === 'Ready to Join';
          const isCompleted = s.status === 'Completed';

          return (
            <div
              key={s.id}
              style={{
                backgroundColor: 'var(--bg-card, #ffffff)',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle, #eaedf5)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={getAvatarUrl(s.tutorId)}
                  alt={s.tutorName}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #3b82f6' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Session with {s.tutorName}
                    </span>
                    <span style={{
                      background: isReady ? '#ecfdf5' : isCompleted ? '#f1f5f9' : '#eff6ff',
                      color: isReady ? '#047857' : isCompleted ? '#475569' : '#1d4ed8',
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '20px'
                    }}>
                      {s.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {s.topic}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    <i className="fa-regular fa-clock" style={{ marginRight: '0.3rem' }}></i>
                    {s.date} • {s.duration} • <span style={{ color: '#10b981', fontWeight: '700' }}>{s.credits} Credits</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                {isReady ? (
                  <button
                    onClick={() => onJoinMeet(s)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.65rem 1.25rem',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <i className="fa-solid fa-video"></i>
                    <span>Join Live Meet</span>
                  </button>
                ) : isCompleted ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b', fontSize: '0.82rem', fontWeight: '700' }}>
                    <span>★★★★★ Reviewed</span>
                  </div>
                ) : (
                  <button
                    disabled
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-muted)',
                      borderRadius: '8px',
                      padding: '0.55rem 1rem',
                      fontSize: '0.8rem',
                      cursor: 'not-allowed'
                    }}
                  >
                    Scheduled
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
