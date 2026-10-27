import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_PERSONAS = {
  sri: {
    id: 'sri',
    email: 'sri@vignan.ac.in',
    name: 'Sri Dhanush',
    role: 'STUDENT',
    college: 'Vignan University',
    major: 'B.Tech CSE (3rd Year, 1st Sem)',
    credits: 4.0,
    escrowLocked: 0.0,
    rating: 4.95,
    reviewsCount: 14,
    badges: ['Vignan Student', '🥇 Elite Master Tutor', 'NPTEL Elite+Gold', '⚡ Fast Responder'],
    isAdmin: false
  },
  rishitha: {
    id: 'rishitha',
    email: 'rishitha@vignan.ac.in',
    name: 'Rishitha',
    role: 'STUDENT',
    college: 'Vignan University',
    major: 'B.Tech IT (3rd Year)',
    credits: 4.0,
    escrowLocked: 0.0,
    rating: 4.98,
    reviewsCount: 18,
    badges: ['🥇 Elite Master Tutor', 'Google UX Certified', 'Figma Pro', 'Vignan Student'],
    isAdmin: false
  },
  bharath: {
    id: 'bharath',
    email: 'bharath@vignan.ac.in',
    name: 'Bharath',
    role: 'STUDENT',
    college: 'Vignan University',
    major: 'B.Tech CSE (4th Year)',
    credits: 6.0,
    escrowLocked: 0.0,
    rating: 4.92,
    reviewsCount: 24,
    badges: ['🥇 Elite Master Tutor', 'AWS Certified', 'Verified Senior'],
    isAdmin: false
  },
  admin: {
    id: 'admin',
    email: 'skrao@vignan.ac.in',
    name: 'Dr. S. K. Rao',
    role: 'ADMIN',
    college: 'Vignan University',
    major: 'Faculty Coordinator & Platform Admin',
    credits: 999.0,
    escrowLocked: 0.0,
    rating: 5.0,
    reviewsCount: 50,
    badges: ['University Admin', 'Faculty Lead', 'Cert Validator'],
    isAdmin: true
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('skillswap_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEMO_PERSONAS.sri;
  });

  const [token, setToken] = useState(() => localStorage.getItem('skillswap_token') || '');

  useEffect(() => {
    if (user) {
      localStorage.setItem('skillswap_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('skillswap_user');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('skillswap_token', data.token);
        }
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      // Fallback to demo accounts
      for (const key of Object.keys(DEMO_PERSONAS)) {
        if (DEMO_PERSONAS[key].email === email) {
          setUser(DEMO_PERSONAS[key]);
          return { success: true };
        }
      }
      return { success: false, message: 'Could not connect to server' };
    }
  };

  const quickLogin = (personaKey) => {
    const persona = DEMO_PERSONAS[personaKey];
    if (persona) {
      setUser(persona);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
  };

  const updateCredits = (newCredits, newEscrow) => {
    setUser(prev => prev ? {
      ...prev,
      credits: newCredits !== undefined ? newCredits : prev.credits,
      escrowLocked: newEscrow !== undefined ? newEscrow : prev.escrowLocked
    } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user),
      login,
      quickLogin,
      logout,
      updateCredits,
      demoPersonas: DEMO_PERSONAS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
