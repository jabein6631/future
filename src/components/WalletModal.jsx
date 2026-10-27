import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function WalletModal({ onClose }) {
  const { user } = useAuth();

  const [transactions] = useState([
    { id: 'tx_101', date: '2026-10-18', type: 'Taught Session', desc: 'Conducted 2 hrs Python OOP for Rishitha', amount: '+5.0 Cr', status: 'Completed' },
    { id: 'tx_102', date: '2026-10-19', type: 'Learned Session', desc: 'Booked 1 hr UI/UX Wireframing from Rishitha', amount: '-2.5 Cr', status: 'Locked in Escrow' },
    { id: 'tx_103', date: '2026-10-15', type: 'Quiz Merit Reward', desc: 'Passed AI Assessment in Python (95% Distinction)', amount: '+2.0 Cr', status: 'Credited' },
    { id: 'tx_104', date: '2026-10-12', type: 'Certificate Bonus', desc: 'Verified NPTEL Elite+Gold Certificate', amount: '+1.5 Cr', status: 'Credited' }
  ]);

  const available = user?.credits || 4.0;
  const locked = user?.escrowLocked || 0.0;
  const totalBalance = available + locked;

  return (
    <div className="modal-overlay active" style={{ zIndex: 1150 }}>
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '620px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Top Header */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b, #047857)',
          padding: '1.25rem 1.75rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-wallet" style={{ fontSize: '1.2rem', color: '#6ee7b7' }}></i>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                Academic Credit Wallet & Escrow
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: '0.2rem' }}>
              Vignan University Smart Time-Banking Ledger
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Balance Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '12px', border: '1px solid #10b981' }}>
              <div style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: '600' }}>Available Credits</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#047857', marginTop: '0.2rem' }}>
                {available.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>Cr</span>
              </div>
            </div>

            <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', border: '1px solid #3b82f6' }}>
              <div style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: '600' }}>Locked in Escrow</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1d4ed8', marginTop: '0.2rem' }}>
                {locked.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>Cr</span>
              </div>
            </div>

            <div style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '12px', border: '1px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.72rem', color: '#5b21b6', fontWeight: '600' }}>Total Net Worth</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#6d28d9', marginTop: '0.2rem' }}>
                {totalBalance.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>Cr</span>
              </div>
            </div>
          </div>

          {/* Smart Escrow Info Note */}
          <div style={{
            background: 'var(--bg-subtle, #f0f3f8)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.2rem', color: '#10b981' }}></i>
            <div>
              <strong>Cashless Peer Escrow Guarantee:</strong> When you book a session, credits are held safely in escrow. They are only released to the mentor after the session is conducted and you submit feedback.
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
              Recent Time-Bank Ledger
            </div>
            <div style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{tx.desc}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {tx.date} • {tx.type}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: tx.amount.startsWith('+') ? '#059669' : '#dc2626' }}>
                      {tx.amount}
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '10px',
                      background: tx.status === 'Completed' || tx.status === 'Credited' ? '#ecfdf5' : '#eff6ff',
                      color: tx.status === 'Completed' || tx.status === 'Credited' ? '#047857' : '#1d4ed8'
                    }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
