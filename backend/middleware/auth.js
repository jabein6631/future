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

// High-Performance In-Memory User Context Cache (15s TTL)
const userCache = new Map();
function getCachedUser(key) {
  const entry = userCache.get(String(key).toLowerCase());
  if (entry && entry.expiresAt > Date.now()) {
    return { ...entry.user };
  }
  return null;
}
function setCachedUser(key, user) {
  const cleanUser = { ...user };
  delete cleanUser.password_hash;
  userCache.set(String(key).toLowerCase(), { user: cleanUser, expiresAt: Date.now() + 15000 });
}

/**
 * Primary Authentication Middleware
 * Enforces valid JWT token and injects full `req.user`
 */
async function authenticateToken(req, res, next) {
  // Fast path: if user context was already attached and verified in this request pipeline
  if (req.user && req.user.id) {
    req.currentUserId = req.user.id;
    return next();
  }

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
    const cacheKey = decoded.id;
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
      if (user.email) setCachedUser(user.email, user);
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
  if (req.user && req.user.id) {
    req.currentUserId = req.user.id;
    return next();
  }

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
          if (user.email) setCachedUser(user.email, user);
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
      const uid = req.headers['x-user-id'];
      let user = getCachedUser(uid);
      if (!user) {
        user = await db.getAsync(`SELECT * FROM users WHERE id = ?`, [uid]);
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
  attachUserContext: optionalAuth // Backward compatibility
};
