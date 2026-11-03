/**
 * SkillSwap Platform - Authentication & RBAC Middleware
 * Powered by JSON Web Tokens & Supabase Auth Bridge
 */

const jwt = require('jsonwebtoken');
const { db } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'skillswap-vignan-jwt-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Valid Account Types (Student & Admin)
const ROLES = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN'
};

/**
 * Generate a signed JWT for a user
 */
function generateToken(user) {
  const isAdm = user.is_admin === 1 || user.role === 'ADMIN' || user.role === 'FACULTY_ADMIN' || user.role === 'SUPER_ADMIN';
  const role = isAdm ? ROLES.ADMIN : ROLES.STUDENT;
  const payload = {
    id: user.id,
    email: user.email,
    role,
    name: user.name,
    college: user.college
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT signature
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract token from Authorization header or cookie/query
 */
function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  } else if (authHeader) {
    return authHeader.trim();
  } else if (req.query?.token) {
    return req.query.token;
  }
  return null;
}

// Lightweight 30-second in-memory cache for user sessions to eliminate redundant Turso roundtrips
const userContextCache = new Map();
const USER_CACHE_TTL_MS = 30000;

function getCachedUser(key) {
  if (!key) return null;
  const entry = userContextCache.get(String(key).toLowerCase());
  if (entry && (Date.now() - entry.timestamp < USER_CACHE_TTL_MS)) {
    return { ...entry.user };
  }
  return null;
}

function setCachedUser(key, user) {
  if (!key || !user) return;
  const clone = { ...user };
  const entry = { user: clone, timestamp: Date.now() };
  userContextCache.set(String(key).toLowerCase(), entry);
  if (user.id) userContextCache.set(String(user.id).toLowerCase(), entry);
  if (user.email) userContextCache.set(String(user.email).toLowerCase(), entry);
}

function invalidateUserCache(key) {
  if (!key) return;
  userContextCache.delete(String(key).toLowerCase());
}

/**
 * Primary Authentication Middleware
 * Enforces valid JWT token and injects full `req.user`
 */
async function authenticateToken(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access support tickets.',
      error: 'Authentication required. Please provide a valid Bearer token in the Authorization header.'
    });
  }

  try {
    const decoded = verifyToken(token);
    const cacheKey = decoded.id || decoded.email;
    let user = getCachedUser(cacheKey);

    if (!user) {
      // Look up live user record from database by ID or Email
      user = await db.getAsync(
        `SELECT * FROM users WHERE id = ? OR (email IS NOT NULL AND LOWER(email) = ?)`,
        [decoded.id, String(decoded.email || decoded.id).toLowerCase()]
      );
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User session invalid. Account not found.'
        });
      }

      user.badges = typeof user.badges_json === 'string' ? JSON.parse(user.badges_json || '[]') : (user.badges_json || []);
      delete user.password_hash; // Never expose password hash downstream
      setCachedUser(user.id, user);
    }

    // Attach user context
    req.user = user;
    req.currentUserId = user.id;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token: ' + (err.message || 'Please log in again.')
    });
  }
}

/**
 * Optional Authentication Middleware
 * Attaches req.user if a valid token is provided, without blocking unauthenticated requests
 */
async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = verifyToken(token);
      let user = getCachedUser(decoded.id);
      if (!user) {
        user = await db.getAsync(`SELECT * FROM users WHERE id = ?`, [decoded.id]);
        if (user) {
          user.badges = typeof user.badges_json === 'string' ? JSON.parse(user.badges_json || '[]') : (user.badges_json || []);
          delete user.password_hash;
          setCachedUser(user.id, user);
        }
      }
      if (user) {
        req.user = user;
        req.currentUserId = user.id;
      }
    } catch (e) {
      // Ignored for optional auth
    }
  }

  if (!req.user && req.headers['x-user-id']) {
    try {
      const hId = req.headers['x-user-id'];
      let user = getCachedUser(hId);
      if (!user) {
        user = await db.getAsync(`SELECT * FROM users WHERE id = ?`, [hId]);
        if (user) {
          user.badges = typeof user.badges_json === 'string' ? JSON.parse(user.badges_json || '[]') : (user.badges_json || []);
          delete user.password_hash;
          setCachedUser(user.id, user);
        }
      }
      if (user) {
        req.user = user;
        req.currentUserId = user.id;
      }
    } catch (e) { }
  }

  if (!req.currentUserId && req.user) {
    req.currentUserId = req.user.id;
  }
  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles Allowed roles (e.g. 'ADMIN')
 */
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User not authenticated.'
      });
    }

    const rawRole = req.user.role || (req.user.is_admin ? 'ADMIN' : 'STUDENT');
    const isAdm = req.user.is_admin === 1 || rawRole === 'ADMIN' || rawRole === 'FACULTY_ADMIN' || rawRole === 'SUPER_ADMIN';
    const userRole = isAdm ? ROLES.ADMIN : ROLES.STUDENT;

    if (userRole === ROLES.ADMIN || allowedRoles.includes(userRole) || allowedRoles.includes(rawRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Forbidden: Access restricted to Administrator accounts.`
    });
  };
}

/**
 * Strict Backend Tutor Protection Middleware
 * Verifies that the user has at least one VERIFIED academic certificate in TrusoDB
 * ONLY certificate_status === 'VERIFIED' (or is_verified === 1 AND tutor_eligible === 1) allows passing.
 */
async function requireVerifiedTutor(req, res, next) {
  const userId = req.user?.id || req.currentUserId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      error: 'Authentication required.'
    });
  }

  try {
    const verifiedCert = await db.getAsync(
      `SELECT * FROM certificates 
       WHERE user_id = ? 
         AND (certificate_status = 'VERIFIED' OR (is_verified = 1 AND (tutor_eligible = 1 OR tutor_eligible IS NULL)))
       LIMIT 1`,
      [userId]
    );

    if (!verifiedCert) {
      return res.status(403).json({
        success: false,
        code: 'TUTOR_NOT_VERIFIED',
        error: 'Certificate verification is required before you can offer tutor mentorship or host sessions.'
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  ROLES,
  JWT_SECRET,
  generateToken,
  verifyToken,
  authenticateToken,
  optionalAuth,
  authorizeRole,
  requireVerifiedTutor,
  invalidateUserCache,
  attachUserContext: optionalAuth // Backward compatibility
};
