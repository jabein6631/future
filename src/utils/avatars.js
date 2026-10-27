/**
 * SkillSwap Platform - High-Fidelity Vector User Logo & Avatar Engine
 * Generates crisp SVG data URIs for all personas
 */

const USER_CONFIGS = {
  sri: {
    name: 'Sri Dhanush',
    initials: 'SD',
    bg: ['#312E81', '#4F46E5'],
    accent: '#60A5FA',
    badge: '🥇 Elite Master',
    badgeIcon: '⚡',
    specialty: 'Python & AI'
  },
  rishitha: {
    name: 'Rishitha',
    initials: 'RS',
    bg: ['#831843', '#BE185D'],
    accent: '#F472B6',
    badge: '🥇 Elite Master',
    badgeIcon: '🎨',
    specialty: 'UI/UX Design'
  },
  bharath: {
    name: 'Bharath',
    initials: 'BH',
    bg: ['#064E3B', '#047857'],
    accent: '#34D399',
    badge: '🥇 Elite Master',
    badgeIcon: '💻',
    specialty: 'React & Node'
  },
  pujitha: {
    name: 'Pujitha',
    initials: 'PJ',
    bg: ['#78350F', '#B45309'],
    accent: '#FBBF24',
    badge: '🎖️ Advanced Tutor',
    badgeIcon: '📊',
    specialty: 'Data Science'
  },
  taman: {
    name: 'Taman',
    initials: 'TM',
    bg: ['#1E1B4B', '#3730A3'],
    accent: '#818CF8',
    badge: '🎖️ Advanced Tutor',
    badgeIcon: '🛡️',
    specialty: 'Cyber Security'
  },
  admin: {
    name: 'Dr. S. K. Rao',
    initials: 'SK',
    bg: ['#1E293B', '#0F172A'],
    accent: '#38BDF8',
    badge: 'University Admin',
    badgeIcon: '🏛️',
    specialty: 'Dept. Coordinator'
  }
};

export function getAvatarUrl(id = 'user') {
  const clean = String(id || 'user').toLowerCase();
  const cfg = USER_CONFIGS[clean] || {
    initials: clean.substring(0, 2).toUpperCase(),
    bg: ['#1E293B', '#334155'],
    accent: '#94A3B8'
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="grad_${clean}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${cfg.bg[0]}" />
          <stop offset="100%" stop-color="${cfg.bg[1]}" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#grad_${clean})" stroke="${cfg.accent}" stroke-width="2.5" />
      <text x="50" y="58" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="700" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">
        ${cfg.initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getUserConfig(id = 'user') {
  const clean = String(id || 'user').toLowerCase();
  return USER_CONFIGS[clean] || {
    name: id,
    badge: 'Student',
    badgeIcon: '🎓',
    specialty: 'General Skills'
  };
}
