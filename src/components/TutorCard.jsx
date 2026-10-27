import React from 'react';
import { getAvatarUrl } from '../utils/avatars';

export default function TutorCard({ tutor, onBook }) {
  // Determine tier badge color and rate
  const tier = tutor.tier || (tutor.rate >= 2.5 ? 'Elite Master' : tutor.rate >= 2.0 ? 'Advanced' : tutor.rate >= 1.5 ? 'Silver' : 'Bronze');
  const tierColor = tier.includes('Elite') ? '#10b981' : tier.includes('Advanced') ? '#8b5cf6' : tier.includes('Silver') ? '#3b82f6' : '#f59e0b';
  const tierBg = tier.includes('Elite') ? '#ecfdf5' : tier.includes('Advanced') ? '#f5f3ff' : tier.includes('Silver') ? '#eff6ff' : '#fffbeb';

  return (
    <div style={{
      backgroundColor: 'var(--bg-card, #ffffff)',
      borderRadius: '16px',
      border: '1px solid var(--border-subtle, #eaedf5)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.04))',
      transition: 'transform 0.2s, box-shadow 0.2s',
      position: 'relative'
    }}>
      {/* Top Header: Avatar & Info */}
      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
        <img
          src={getAvatarUrl(tutor.id)}
          alt={tutor.name}
          style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${tierColor}` }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tutor.name}
            </h3>
            {/* Tier Pill */}
            <span style={{
              background: tierBg,
              color: tierColor,
              border: `1px solid ${tierColor}40`,
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '0.2rem 0.5rem',
              borderRadius: '20px',
              whiteSpace: 'nowrap'
            }}>
              {tier}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {tutor.major || tutor.college || 'Vignan University'}
          </div>

          {/* Star Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
            <i className="fa-solid fa-star" style={{ color: '#f59e0b', fontSize: '0.75rem' }}></i>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {tutor.rating?.toFixed(2) || '5.00'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              ({tutor.reviewsCount || tutor.reviews_count || 12} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Bio / Description */}
      <p style={{
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        margin: 0,
        lineHeight: 1.45,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {tutor.bio || 'Passionate peer tutor at Vignan University ready to exchange skills and mentor students.'}
      </p>

      {/* Skills Offered & Wanted */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {(tutor.skills || ['Python', 'DSA', 'Machine Learning']).map((sk, idx) => (
          <span key={idx} style={{
            background: 'var(--bg-subtle, #f0f3f8)',
            color: 'var(--text-primary)',
            fontSize: '0.72rem',
            fontWeight: '600',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px'
          }}>
            {sk}
          </span>
        ))}
      </div>

      {/* Bottom Footer: Rate & Book Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-subtle, #eaedf5)',
        marginTop: 'auto'
      }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Exchange Rate
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
            {tutor.rate?.toFixed(1) || '2.0'} <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Cr/hr</span>
          </div>
        </div>

        <button
          onClick={() => onBook(tutor)}
          style={{
            background: 'linear-gradient(135deg, #0d233a, #1e3a8a)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.55rem 1rem',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(13, 35, 58, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <i className="fa-regular fa-calendar-plus"></i>
          <span>Book Session</span>
        </button>
      </div>
    </div>
  );
}
