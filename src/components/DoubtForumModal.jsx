import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatars';

export default function DoubtForumModal({ onClose }) {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([
    {
      id: 'd_1',
      author: 'Sri Dhanush',
      authorId: 'sri',
      title: 'How does React Reconciliation determine component re-mounts when keys change?',
      tags: ['React.js', 'Virtual DOM', 'State'],
      answersCount: 3,
      date: '2 hours ago',
      resolved: true
    },
    {
      id: 'd_2',
      author: 'Pujitha',
      authorId: 'pujitha',
      title: 'Index performance on high-cardinality foreign keys in PostgreSQL database engine',
      tags: ['SQL', 'PostgreSQL', 'Indexing'],
      answersCount: 2,
      date: '5 hours ago',
      resolved: false
    },
    {
      id: 'd_3',
      author: 'Taman',
      authorId: 'taman',
      title: 'Preventing cross-site request forgery (CSRF) in JWT bearer cookie architecture',
      tags: ['Security', 'JWT', 'Web Security'],
      answersCount: 4,
      date: 'Yesterday',
      resolved: true
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('React.js');
  const [submitting, setSubmitting] = useState(false);

  const handlePostDoubt = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    const newEntry = {
      id: 'd_' + Date.now(),
      author: user?.name || 'You',
      authorId: user?.id || 'sri',
      title: newTitle,
      tags: [newTag, 'Vignan Peer Help'],
      answersCount: 0,
      date: 'Just now',
      resolved: false
    };

    setDoubts([newEntry, ...doubts]);
    setNewTitle('');
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 1150 }}>
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '680px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #3730a3)',
          padding: '1.25rem 1.75rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-circle-question" style={{ fontSize: '1.2rem', color: '#a5b4fc' }}></i>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                Vignan Peer Doubt & Support Forum
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c7d2fe', marginTop: '0.2rem' }}>
              Ask Academic Doubts • Earn Community Mentorship Credits
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Post Form */}
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
          <form onSubmit={handlePostDoubt} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>Ask a Doubt to University Mentors:</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What is your concept question or bug error?"
                style={{
                  flex: 1,
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.82rem'
                }}
              />
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.82rem'
                }}
              >
                <option value="React.js">React.js</option>
                <option value="Python & AI">Python & AI</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="SQL Databases">SQL Databases</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.1rem',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Post
              </button>
            </div>
          </form>
        </div>

        {/* Doubts Feed */}
        <div style={{ padding: '1.25rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {doubts.map(d => (
            <div key={d.id} style={{
              background: 'var(--bg-card, #ffffff)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={getAvatarUrl(d.authorId)} alt={d.author} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{d.author}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {d.date}</span>
                </div>
                {d.resolved && (
                  <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
                    ✓ Solved by Mentor
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {d.title}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {d.tags.map((t, idx) => (
                    <span key={idx} style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontSize: '0.68rem', fontWeight: '600', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      #{t}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: '600' }}>
                  💬 {d.answersCount} Mentor Answers
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
