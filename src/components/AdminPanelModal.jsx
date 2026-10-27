import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatars';

export default function AdminPanelModal({ onClose }) {
  const { user } = useAuth();

  const [pendingCerts, setPendingCerts] = useState([
    {
      id: 'cert_req_1',
      studentName: 'Sri Dhanush',
      studentId: 'sri',
      rollNo: '221FA04001',
      certName: 'NPTEL Elite+Gold (94%) - Python & DSA',
      issuer: 'IIT Madras / SWAYAM',
      requestedTier: '🥇 Elite Master Tutor (2.5 Cr/hr)',
      status: 'Pending Review'
    },
    {
      id: 'cert_req_2',
      studentName: 'Rishitha',
      studentId: 'rishitha',
      rollNo: '221FA07012',
      certName: 'Google UX Design Professional Certificate',
      issuer: 'Google Career Certificates',
      requestedTier: '🥇 Elite Master Tutor (2.5 Cr/hr)',
      status: 'Pending Review'
    },
    {
      id: 'cert_req_3',
      studentName: 'Taman',
      studentId: 'taman',
      rollNo: '221FA04189',
      certName: 'CompTIA Security+ SY0-701 Certification',
      issuer: 'CompTIA',
      requestedTier: '🎖️ Advanced Tutor (2.0 Cr/hr)',
      status: 'Pending Review'
    }
  ]);

  const [actionMessage, setActionMessage] = useState('');

  const handleAction = (id, action) => {
    setPendingCerts(prev => prev.filter(c => c.id !== id));
    setActionMessage(`Certificate ${id} was successfully ${action} by Faculty Admin.`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 1200 }}>
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '720px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          padding: '1.25rem 1.75rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.2rem', color: '#38bdf8' }}></i>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                University Faculty Administration
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Coordinator: Dr. S. K. Rao (Vignan University Dept. of CSE)
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Action notification */}
        {actionMessage && (
          <div style={{ background: '#ecfdf5', borderBottom: '1px solid #10b981', color: '#047857', padding: '0.65rem 1.75rem', fontSize: '0.8rem', fontWeight: '600' }}>
            ✓ {actionMessage}
          </div>
        )}

        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending Verifications</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0284c7' }}>{pendingCerts.length} Files</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SQLite / Database Engine</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981' }}>Online</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>WebRTC Signaling</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#8b5cf6' }}>Active</div>
            </div>
          </div>

          {/* Pending Verification Requests Table */}
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
              Pending NPTEL & Academic Certificate Audits
            </div>

            {pendingCerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                All pending certificate approvals are complete!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingCerts.map(cert => (
                  <div key={cert.id} style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img src={getAvatarUrl(cert.studentId)} alt={cert.studentName} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {cert.studentName} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400' }}>({cert.rollNo})</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: '600', marginTop: '0.1rem' }}>
                          {cert.certName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Issuer: {cert.issuer} • Target Tier: <strong style={{ color: '#059669' }}>{cert.requestedTier}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleAction(cert.id, 'Approved')}
                        style={{
                          background: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Approve & Verify
                      </button>
                      <button
                        onClick={() => handleAction(cert.id, 'Rejected')}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          borderRadius: '6px',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
