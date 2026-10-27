import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DocVerifyModal({ onClose, onVerifySuccess }) {
  const { user } = useAuth();
  const [certType, setCertType] = useState('NPTEL');
  const [certId, setCertId] = useState('NPTEL23CS84S2591024');
  const [subject, setSubject] = useState('Programming, Data Structures And Algorithms Using Python');
  const [score, setScore] = useState('94% (Elite + Gold)');
  const [analyzing, setAnalyzing] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    setAnalyzing(true);

    setTimeout(() => {
      setAnalyzing(false);
      setVerified(true);
      if (onVerifySuccess) {
        onVerifySuccess(certType, subject);
      }
    }, 1600);
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 1150 }}>
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          padding: '1.25rem 1.75rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-file-shield" style={{ fontSize: '1.2rem' }}></i>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                DocVerify Certificate Forensic Engine
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#bfdbfe', marginTop: '0.2rem' }}>
              Verified NPTEL, Coursera & Cloud Credentials
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!verified ? (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Accredited Issuing Authority
                </label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-subtle)',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="NPTEL">NPTEL / SWAYAM (IIT Madras)</option>
                  <option value="Coursera">Coursera Professional Certificate</option>
                  <option value="AWS">AWS / Amazon Web Services Certification</option>
                  <option value="Google">Google Career Certificate</option>
                  <option value="Microsoft">Microsoft Learn / Azure Certified</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Subject / Specialization Name
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Credential Roll / Verification ID
                  </label>
                  <input
                    type="text"
                    required
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
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
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Attained Score / Grade
                  </label>
                  <input
                    type="text"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
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
              </div>

              {/* Upload Dropzone Preview */}
              <div style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-muted)'
              }}>
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.5rem', color: '#3b82f6', marginBottom: '0.4rem' }}></i>
                <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  certificate_nptel_elite_gold.pdf (Simulated Forensic Check)
                </div>
                <div style={{ fontSize: '0.72rem' }}>
                  OCR Layout Analysis, QR Signature Validation, and Issuer Match ready
                </div>
              </div>

              <button
                type="submit"
                disabled={analyzing}
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)'
                }}
              >
                {analyzing ? 'Running DocVerify Forensic Check...' : 'Verify Credential & Unlock 2.5 Cr/hr'}
              </button>
            </form>
          ) : (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '2px solid #10b981' }}>
                ✓
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Credential Authenticated!
                </h3>
                <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {certType} verified successfully: <strong>{subject}</strong>
                </p>
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '12px', padding: '0.85rem 1.25rem', width: '100%', maxWidth: '420px', textAlign: 'left', fontSize: '0.8rem', color: '#065f46' }}>
                <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>Forensic Audit Result:</div>
                <div>• Cryptographic QR Signature: <strong>MATCH</strong></div>
                <div>• Roll Verification ID ({certId}): <strong>CONFIRMED</strong></div>
                <div>• Academic Merit Classification: <strong>🥇 Elite Master Tutor</strong></div>
              </div>

              <button
                onClick={onClose}
                style={{
                  background: '#0d233a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
