import React, { useState, useEffect } from 'react';
import TutorCard from './TutorCard';

const INITIAL_TUTORS = [
  {
    id: 'sri',
    name: 'Sri Dhanush',
    college: 'Vignan University',
    major: 'B.Tech CSE (3rd Year)',
    rate: 2.5,
    tier: '🥇 Elite Master',
    rating: 4.95,
    reviewsCount: 14,
    skills: ['Python OOP', 'Machine Learning', 'Data Structures'],
    bio: 'NPTEL Elite+Gold (94%) certified in Python. Mentoring peers in OOP, Algorithms, and ML pipelines.',
    category: 'Python & AI'
  },
  {
    id: 'rishitha',
    name: 'Rishitha',
    college: 'Vignan University',
    major: 'B.Tech IT (3rd Year)',
    rate: 2.5,
    tier: '🥇 Elite Master',
    rating: 4.98,
    reviewsCount: 18,
    skills: ['UI/UX Design', 'Figma Pro', 'Design Systems', 'Prototypes'],
    bio: 'Google UX Design Professional Certified. Passionate about design tokens, Figma component systems, and accessible UX.',
    category: 'UI/UX & Design'
  },
  {
    id: 'bharath',
    name: 'Bharath',
    college: 'Vignan University',
    major: 'B.Tech CSE (4th Year)',
    rate: 2.5,
    tier: '🥇 Elite Master',
    rating: 4.92,
    reviewsCount: 24,
    skills: ['React.js Frontend', 'Node.js Express', 'REST APIs', 'AWS Cloud'],
    bio: 'Fullstack developer & AWS Certified Developer. Mentoring students in React components, custom hooks, and scalable APIs.',
    category: 'Fullstack & Web'
  },
  {
    id: 'pujitha',
    name: 'Pujitha',
    college: 'Vignan University',
    major: 'B.Tech AI & Data Science (3rd Year)',
    rate: 2.0,
    tier: '🎖️ Advanced Tutor',
    rating: 4.86,
    reviewsCount: 9,
    skills: ['SQL & PostgreSQL', 'Database Design', 'Pandas & NumPy'],
    bio: 'NPTEL DBMS Silver certified. Guiding juniors through database normalization, complex SQL joins, and exploratory data analysis.',
    category: 'Data Science & SQL'
  },
  {
    id: 'taman',
    name: 'Taman',
    college: 'Vignan University',
    major: 'B.Tech Cyber Security (3rd Year)',
    rate: 2.0,
    tier: '🎖️ Advanced Tutor',
    rating: 4.88,
    reviewsCount: 8,
    skills: ['Cyber Security', 'Linux Terminal', 'Network Defense', 'OWASP Top 10'],
    bio: 'CompTIA Security+ Certified. Hands-on mentoring in Linux administration, vulnerability assessments, and web security hygiene.',
    category: 'Cybersecurity'
  }
];

export default function TutorMarketplace({ searchQuery, onBook }) {
  const [tutors, setTutors] = useState(INITIAL_TUTORS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');

  // Attempt to fetch fresh tutors list from backend
  useEffect(() => {
    fetch('/api/skills')
      .then(res => res.json())
      .then(data => {
        if (data && data.skills && data.skills.length > 0) {
          // Format tutors if API returns structured skill entries
          // Keep INITIAL_TUTORS as baseline for reliability
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Python & AI', 'UI/UX & Design', 'Fullstack & Web', 'Data Science & SQL', 'Cybersecurity'];
  const tiers = ['All', 'Elite Master', 'Advanced', 'Silver', 'Bronze'];

  const filteredTutors = tutors.filter(t => {
    // Search query filter
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      t.name.toLowerCase().includes(q) ||
      t.major.toLowerCase().includes(q) ||
      t.skills.some(s => s.toLowerCase().includes(q)) ||
      t.bio.toLowerCase().includes(q);

    // Category filter
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

    // Tier filter
    const matchesTier = selectedTier === 'All' || t.tier.includes(selectedTier);

    return matchesSearch && matchesCategory && matchesTier;
  });

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero Stats Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d233a 0%, #1e3a8a 50%, #312e81 100%)',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        color: '#ffffff',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.65rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            Vignan University Cashless Time-Banking
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Peer-to-Peer Skill Exchange
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '520px' }}>
            Trade hourly knowledge credits. Qualify through AI dynamic assessments with competitive negative marking (+3/-1/0).
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', minWidth: '260px' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active Mentors</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '850', color: '#38bdf8' }}>48 Tutors</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Smart Escrow</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '850', color: '#34d399' }}>100% Safe</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Avg. Rating</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '850', color: '#fbbf24' }}>4.94 ★</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Sessions</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '850', color: '#f472b6' }}>184 Completed</div>
          </div>
        </div>
      </div>

      {/* Filter Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginRight: '0.25rem' }}>
            Domain:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#0d233a' : 'var(--bg-card, #ffffff)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-medium, #d9e2ec)',
                borderRadius: '20px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tier Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginRight: '0.25rem' }}>
            Tutor Tier:
          </span>
          {tiers.map(tr => (
            <button
              key={tr}
              onClick={() => setSelectedTier(tr)}
              style={{
                background: selectedTier === tr ? '#1e3a8a' : 'var(--bg-card, #ffffff)',
                color: selectedTier === tr ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-medium, #d9e2ec)',
                borderRadius: '20px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tr === 'All' ? 'All Tiers' : tr}
            </button>
          ))}
        </div>
      </div>

      {/* Tutor Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredTutors.map(tutor => (
          <TutorCard key={tutor.id} tutor={tutor} onBook={onBook} />
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#94a3b8' }}></i>
          <h3>No tutors found</h3>
          <p>Try resetting your search or selecting another category.</p>
        </div>
      )}
    </div>
  );
}
