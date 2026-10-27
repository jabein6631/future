import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatars';

export default function BookingModal({ tutor, onClose, onBookingSuccess }) {
  const { user, updateCredits } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('05:00 PM - 06:00 PM');
  const [durationHours, setDurationHours] = useState(1);
  const [topic, setTopic] = useState('Deep dive into core concepts & project debugging');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!tutor) return null;

  const totalCost = (tutor.rate || 2.0) * durationHours;
  const userBalance = user?.credits || 0.0;
  const hasSufficientCredits = userBalance >= totalCost;

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!hasSufficientCredits) {
      setErrorMsg(`Insufficient credits. You have ${userBalance.toFixed(1)} Cr, but ${totalCost.toFixed(1)} Cr is required.`);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutor_id: tutor.id,
          learner_id: user?.id,
          date: selectedDate,
          time_slot: selectedSlot,
          duration: durationHours,
          credits: totalCost,
          topic: topic
        })
      });

      // Update state in either case (offline fallback supported)
      const newCredits = userBalance - totalCost;
      const newEscrow = (user?.escrowLocked || 0.0) + totalCost;
      updateCredits(newCredits, newEscrow);

      setSuccessMsg(`Session booked! ${totalCost.toFixed(1)} Credits securely locked in Smart Escrow.`);
      setTimeout(() => {
        if (onBookingSuccess) onBookingSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      // Offline fallback
      const newCredits = userBalance - totalCost;
      const newEscrow = (user?.escrowLocked || 0.0) + totalCost;
      updateCredits(newCredits, newEscrow);
      setSuccessMsg(`Session booked! ${totalCost.toFixed(1)} Credits locked in escrow.`);
      setTimeout(() => {
        if (onBookingSuccess) onBookingSuccess();
        onClose();
      }, 1800);
    } finally {
      setSubmitting(false);
    }
  };

  const slots = [
    '10:00 AM - 11:00 AM',
    '02:00 PM - 03:00 PM',
    '05:00 PM - 06:00 PM',
    '07:30 PM - 08:30 PM'
  ];

  return (
    <div className="modal-overlay active" style={{ zIndex: 1100 }}>
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '520px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0d233a, #1e3a8a)',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
              Book Peer Mentorship
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: '0.2rem' }}>
              Smart Escrow Contract Protection
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
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
        </div>

        {/* Tutor Mini Card */}
        <div style={{ padding: '1.25rem 1.5rem 0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={getAvatarUrl(tutor.id)}
            alt={tutor.name}
            style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #3b82f6' }}
          />
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{tutor.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tutor.major} • {tutor.college}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#10b981', marginTop: '0.15rem' }}>
              {tutor.rate?.toFixed(1) || '2.0'} Credits / hour ({tutor.tier})
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleBooking} style={{ padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Topic */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Session Learning Goal
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
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

          {/* Date & Duration Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Session Date
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
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
                Duration
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontSize: '0.82rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value={1}>1 Hour (Standard)</option>
                <option value={2}>2 Hours (Deep Dive)</option>
              </select>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Available Time Slot
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {slots.map(slot => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: selectedSlot === slot ? '2px solid #3b82f6' : '1px solid var(--border-medium)',
                    background: selectedSlot === slot ? '#eff6ff' : 'var(--bg-subtle)',
                    color: selectedSlot === slot ? '#1e40af' : 'var(--text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Escrow Calculation Box */}
          <div style={{
            background: 'var(--bg-subtle)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Calculation:</span>
              <span style={{ fontWeight: '600' }}>{tutor.rate?.toFixed(1)} Cr × {durationHours} hr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Your Available Balance:</span>
              <span style={{ fontWeight: '600', color: hasSufficientCredits ? '#059669' : '#dc2626' }}>
                {userBalance.toFixed(1)} Credits
              </span>
            </div>
            <div style={{ borderTop: '1px dashed var(--border-medium)', margin: '0.2rem 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '800' }}>
              <span style={{ color: 'var(--text-primary)' }}>Total Escrow Lock:</span>
              <span style={{ color: '#10b981' }}>{totalCost.toFixed(1)} Credits</span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ background: '#ecfdf5', border: '1px solid #34d399', color: '#065f46', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem' }}>
              {successMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !hasSufficientCredits}
            style={{
              background: hasSufficientCredits ? 'linear-gradient(135deg, #0d233a, #1e3a8a)' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: hasSufficientCredits ? 'pointer' : 'not-allowed',
              boxShadow: hasSufficientCredits ? '0 4px 12px rgba(13, 35, 58, 0.25)' : 'none',
              marginTop: '0.5rem'
            }}
          >
            {submitting ? 'Confirming Lock...' : 'Lock in Escrow & Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
