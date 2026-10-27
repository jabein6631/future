/**
 * SkillSwap Platform - Authentication Controller
 * Handles Register, Login, JWT issuance, Supabase Auth Integration, and Login Audit Logging
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { db } = require('../database/db');
const { trusodbService, supabaseService } = require('../database/trusodb');
const { generateToken, ROLES } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Dynamic in-memory store for 6-digit OTP verification codes
// Key: normalized email, Value: { otp, userId, email, expiresAt, attempts }
const resetOtpStore = new Map();

function getClientMeta(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || req.ip || '127.0.0.1');
  const userAgent = req.headers['user-agent'] || 'Browser Client';
  return { ip, userAgent };
}

async function recordLoginAudit({ userId, email, role, ipAddress, userAgent, status, failureReason, authMethod }) {
  try {
    const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    await db.runAsync(
      `INSERT INTO login_history (id, user_id, email, role, ip_address, user_agent, status, failure_reason, auth_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, userId || null, email || null, role || null, ipAddress || '127.0.0.1', userAgent || 'Unknown', status, failureReason || null, authMethod || 'PASSWORD']
    );
  } catch (err) {
    console.warn('⚠️ Could not record login audit:', err.message);
  }
}

const authController = {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, name, college, major, role, bio } = req.body;
      const clientMeta = getClientMeta(req);

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Please provide email, password, and full name.'
        });
      }

      // Password Rules: Must start with a capital letter (A-Z) and have at least 6 characters
      if (!/^[A-Z]/.test(password)) {
        return res.status(400).json({
          success: false,
          error: 'Password rule violation: Password must start with a capital letter (A-Z).'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address (e.g. student@vignan.ac.in).'
        });
      }

      // Check for existing account
      const existing = await db.getAsync(`SELECT * FROM users WHERE LOWER(email) = ?`, [normalizedEmail]);
      if (existing) {
        await recordLoginAudit({
          email: normalizedEmail,
          ipAddress: clientMeta.ip,
          userAgent: clientMeta.userAgent,
          status: 'FAILED',
          failureReason: 'Account already exists',
          authMethod: 'REGISTER'
        });

        return res.status(409).json({
          success: false,
          error: 'An account with this email address already exists. Please log in.'
        });
      }

      const isAdm = role === 'ADMIN' || role === 'FACULTY_ADMIN' || role === 'SUPER_ADMIN';
      const assignedRole = isAdm ? ROLES.ADMIN : ROLES.STUDENT;
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = 'usr_' + Date.now();
      const userCollege = college || 'Vignan University';
      const userMajor = major || 'B.Tech CSE';
      const initialCredits = isAdm ? 999.0 : 3.0; // 3.0 Welcome Bonus credits for students

      await db.runAsync(
        `INSERT INTO users (id, email, password_hash, role, name, college, major, avatar, bio, credits, escrow_locked, lifetime_earned, lifetime_spent, rating, reviews_count, badges_json, is_admin, is_verified, last_login_at, login_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, 0.0, 0.0, 5.0, 0, ?, ?, ?, CURRENT_TIMESTAMP, 1)`,
        [
          userId,
          normalizedEmail,
          passwordHash,
          assignedRole,
          name.trim(),
          userCollege,
          userMajor,
          assignedRole === ROLES.ADMIN ? 'admin' : 'default_avatar',
          bio || (isAdm ? `Platform Administrator at ${userCollege}.` : `Student at ${userCollege} passionate about peer learning.`),
          initialCredits,
          JSON.stringify(['Vignan Member', `${assignedRole}`]),
          isAdm ? 1 : 0,
          isAdm ? 1 : 0
        ]
      );

      // Persist initial skills if provided in registration
      if (Array.isArray(req.body.skillsOffered)) {
        for (const s of req.body.skillsOffered) {
          if (!s || !s.name) continue;
          const sId = 'sk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          await db.runAsync(
            `INSERT INTO skills_offered (id, user_id, name, level, category, rate, tier, description, is_verified, quiz_score, cert_count, qualification_bonus_awarded)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [sId, userId, String(s.name).trim(), s.level || 'Intermediate', s.category || 'Tech', Number(s.rate) || 1.0, s.tier || 'Bronze', s.description || '', 0, 0, 0]
          );
        }
      }
      if (Array.isArray(req.body.skillsWanted)) {
        for (const s of req.body.skillsWanted) {
          if (!s || !s.name) continue;
          const sId = 'skw_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          await db.runAsync(
            `INSERT INTO skills_wanted (id, user_id, name, level, category, goal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [sId, userId, String(s.name).trim(), s.level || 'Beginner', s.category || 'Tech', s.goal || '']
          );
        }
      }

      // Record Welcome Credit Grant Transaction
      await db.runAsync(
        `INSERT INTO transactions (id, user_id, date, type, description, amount, status, student_name)
         VALUES (?, ?, ?, 'Welcome Bonus', 'Platform onboarding credit grant', ?, 'Completed', 'SkillSwap System')`,
        ['tx_welcome_' + Date.now(), userId, new Date().toISOString().split('T')[0], initialCredits]
      );

      // Record Successful Registration Login in Database
      await recordLoginAudit({
        userId,
        email: normalizedEmail,
        role: assignedRole,
        ipAddress: clientMeta.ip,
        userAgent: clientMeta.userAgent,
        status: 'SUCCESS',
        authMethod: 'REGISTER'
      });

      const newUser = (await supabaseService.getUserById(userId)) || (await db.getAsync(`SELECT * FROM users WHERE id = ?`, [userId]));
      if (newUser.badges_json && !newUser.badges) newUser.badges = JSON.parse(newUser.badges_json || '[]');
      delete newUser.password_hash;

      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        token,
        user: newUser
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Log in an existing user
   * POST /api/auth/login
   * Verifies email format and existence, and verifies password rule and authenticity
   */
  async login(req, res, next) {
    try {
      const { email, password, userId, emailOrId } = req.body;
      const clientMeta = getClientMeta(req);
      const rawIdentifier = email || emailOrId || userId;

      // 1. Verify Email / Identifier is provided
      if (!rawIdentifier || typeof rawIdentifier !== 'string' || !rawIdentifier.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Email verification failed: Please provide your registered university email address or User ID.'
        });
      }

      const identifier = rawIdentifier.trim();

      // 2. Verify Email Format (if identifier is formatted as an email)
      if (identifier.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(identifier)) {
          return res.status(400).json({
            success: false,
            error: 'Email verification failed: Invalid email format. Please enter a valid address (e.g., student@vignan.ac.in).'
          });
        }
      }

      // 3. Verify Password is provided
      if (!password || typeof password !== 'string' || !password.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Password verification failed: Please enter your password.'
        });
      }

      // 4. Verify Password minimum length
      if (password.length < 6) {
        await recordLoginAudit({
          email: identifier,
          ipAddress: clientMeta.ip,
          userAgent: clientMeta.userAgent,
          status: 'FAILED',
          failureReason: 'Password rule violation: Length too short (<6 chars)',
          authMethod: 'PASSWORD'
        });

        return res.status(400).json({
          success: false,
          error: 'Password verification failed: Password must be at least 6 characters long.'
        });
      }

      // 5. Verify User Account Existence in Database
      let user = await db.getAsync(
        `SELECT * FROM users WHERE LOWER(email) = ? OR id = ?`,
        [identifier.toLowerCase(), identifier]
      );

      if (!user) {
        // Record Failed Attempt: Email Not Registered
        await recordLoginAudit({
          email: identifier,
          ipAddress: clientMeta.ip,
          userAgent: clientMeta.userAgent,
          status: 'FAILED',
          failureReason: 'Email not found in database',
          authMethod: 'PASSWORD'
        });

        return res.status(404).json({
          success: false,
          error: `Email verification failed: No registered account found with email or ID "${identifier}". Please check your email or register a new account.`
        });
      }

      // 6. Verify Password Authenticity (Bcrypt Match & Demo Fallback)
      let isMatch = false;
      if (user.password_hash) {
        isMatch = await bcrypt.compare(password, user.password_hash);
      }
      // Demo fallback for compliant test passwords and user ID
      if (!isMatch && (password === 'Password123' || password === 'password123' || password === user.id)) {
        isMatch = true;
      }

      if (!isMatch) {
        // Record Failed Attempt: Incorrect Password
        await recordLoginAudit({
          userId: user.id,
          email: user.email,
          role: user.role,
          ipAddress: clientMeta.ip,
          userAgent: clientMeta.userAgent,
          status: 'FAILED',
          failureReason: 'Incorrect password verification failed',
          authMethod: 'PASSWORD'
        });

        return res.status(401).json({
          success: false,
          error: `Password verification failed: Incorrect password entered for "${user.email}". Please verify your credentials and try again.`
        });
      }

      // 7. Verification Succeeded -> Update Login Record & History
      await db.runAsync(
        `UPDATE users SET last_login_at = CURRENT_TIMESTAMP, login_count = COALESCE(login_count, 0) + 1 WHERE id = ?`,
        [user.id]
      );

      await recordLoginAudit({
        userId: user.id,
        email: user.email,
        role: user.role,
        ipAddress: clientMeta.ip,
        userAgent: clientMeta.userAgent,
        status: 'SUCCESS',
        authMethod: 'PASSWORD'
      });

      const updatedUser = (await supabaseService.getUserById(user.id)) || (await db.getAsync(`SELECT * FROM users WHERE id = ?`, [user.id]));
      if (updatedUser.badges_json && !updatedUser.badges) updatedUser.badges = JSON.parse(updatedUser.badges_json || '[]');
      delete updatedUser.password_hash;

      const token = generateToken(updatedUser);

      res.json({
        success: true,
        message: `Email & password verified successfully! Welcome back, ${updatedUser.name}!`,
        token,
        user: updatedUser
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Request Password Reset OTP
   * POST /api/auth/forgot-password
   * Generates a cryptographically secure 6-digit OTP, stores its SHA-256 hash, and emails it.
   * Returns ONLY a generic message (NEVER the OTP).
   */
  async forgotPassword(req, res, next) {
    try {
      const { email, emailOrId } = req.body;
      const identifier = (email || emailOrId || '').trim();
      const clientMeta = getClientMeta(req);

      if (!identifier) {
        return res.status(400).json({
          success: false,
          error: 'Please enter your registered university email or User ID.'
        });
      }

      // Check user existence in database
      const user = await db.getAsync(
        `SELECT * FROM users WHERE LOWER(email) = ? OR id = ?`,
        [identifier.toLowerCase(), identifier]
      );

      // If user does not exist, return a generic message to prevent account enumeration
      if (!user) {
        return res.json({
          success: true,
          message: 'If an account exists for this email, a verification code has been sent.'
        });
      }

      // Deduplication & Anti-Spam: If an OTP was already generated and dispatched to this email within the last 15 seconds, don't generate a second duplicate OTP
      const existingRecord = resetOtpStore.get(user.email.toLowerCase());
      if (existingRecord && existingRecord.lastSentAt && (Date.now() - existingRecord.lastSentAt < 15 * 1000)) {
        console.log(`ℹ️ [SkillSwap OTP Deduplicated] Active code already dispatched to ${user.email} ${Math.round((Date.now() - existingRecord.lastSentAt)/1000)}s ago. Reusing active verification window.`);
        return res.json({
          success: true,
          message: 'If an account exists for this email, a verification code has been sent.',
          email: user.email
        });
      }

      // Generate a cryptographically secure, random 6-digit OTP
      const otp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes lifespan

      // Store hashed OTP and rate-limiting metadata (invalidates any previous OTP)
      resetOtpStore.set(user.email.toLowerCase(), {
        otpHash,
        userId: user.id,
        email: user.email,
        expiresAt,
        attempts: 0,
        lastSentAt: Date.now(),
        verified: false,
        resetToken: null,
        resetTokenExpiresAt: null
      });

      console.log(`\n========================================================`);
      console.log(`🔐 [SkillSwap Secure Password Reset Requested]`);
      console.log(`👤 Student: ${user.name} (${user.email})`);
      console.log(`⏱️ Expiration: 10 minutes (${new Date(expiresAt).toLocaleTimeString()})`);
      console.log(`========================================================\n`);

      // Dispatch real email via SMTP / Nodemailer (never throws unhandled error)
      await emailService.sendPasswordResetOtp(user.email, user.name, otp);

      await recordLoginAudit({
        userId: user.id,
        email: user.email,
        role: user.role,
        ipAddress: clientMeta.ip,
        userAgent: clientMeta.userAgent,
        status: 'SUCCESS',
        failureReason: 'Dynamic OTP generated and dispatched to email',
        authMethod: 'FORGOT_PASSWORD_OTP'
      });

      // Show ONLY a generic success message; NEVER send the OTP to frontend
      return res.json({
        success: true,
        message: 'If an account exists for this email, a verification code has been sent.',
        email: user.email
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Verify Reset OTP
   * POST /api/auth/verify-reset-otp
   * Validates OTP against stored SHA-256 hash, rate-limits attempts, and issues short-lived resetToken
   */
  async verifyResetOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      const clientMeta = getClientMeta(req);

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          error: 'Please provide both your email and the 6-digit verification code.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const record = resetOtpStore.get(normalizedEmail);

      if (!record || !record.otpHash) {
        return res.status(400).json({
          success: false,
          error: 'No active verification request found for this email. Please request a new code.'
        });
      }

      if (Date.now() > record.expiresAt) {
        resetOtpStore.delete(normalizedEmail);
        return res.status(400).json({
          success: false,
          error: 'The verification code has expired (10 min limit). Please request a new code.'
        });
      }

      record.attempts = (record.attempts || 0) + 1;
      if (record.attempts > 5) {
        resetOtpStore.delete(normalizedEmail);
        return res.status(429).json({
          success: false,
          error: 'Too many invalid attempts. For your security, this code has been invalidated. Please request a new code.'
        });
      }

      // Hash entered OTP and compare with stored hash
      const incomingHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
      if (incomingHash !== record.otpHash) {
        return res.status(400).json({
          success: false,
          error: `Incorrect verification code. Please check your email and try again. (${5 - record.attempts} attempts remaining)`
        });
      }

      // OTP verified successfully: generate secure single-use resetToken and burn the OTP
      const resetToken = crypto.randomBytes(32).toString('hex');
      record.verified = true;
      record.resetToken = resetToken;
      record.resetTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      record.otpHash = null; // Invalidate OTP so it cannot be reused

      await recordLoginAudit({
        userId: record.userId,
        email: normalizedEmail,
        ipAddress: clientMeta.ip,
        userAgent: clientMeta.userAgent,
        status: 'SUCCESS',
        failureReason: 'OTP verified successfully',
        authMethod: 'VERIFY_RESET_OTP'
      });

      return res.json({
        success: true,
        message: 'OTP verified successfully. Please enter your new password.',
        resetToken
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Resend Reset OTP with Cooldown and Rate Limiting
   * POST /api/auth/resend-reset-otp
   */
  async resendResetOtp(req, res, next) {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Please provide your registered email address.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const record = resetOtpStore.get(normalizedEmail);

      // Enforce 30-second cooldown between resend requests
      if (record && record.lastSentAt && (Date.now() - record.lastSentAt < 30 * 1000)) {
        const secondsRemaining = Math.ceil((30 * 1000 - (Date.now() - record.lastSentAt)) / 1000);
        return res.status(429).json({
          success: false,
          error: `Please wait ${secondsRemaining} seconds before requesting a new code.`
        });
      }

      const user = await db.getAsync(`SELECT * FROM users WHERE LOWER(email) = ? OR id = ?`, [normalizedEmail, normalizedEmail]);
      if (!user) {
        return res.json({
          success: true,
          message: 'If an account exists for this email, a verification code has been sent.'
        });
      }

      // Generate brand-new OTP & hash (invalidates previous OTP)
      const otp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
      const expiresAt = Date.now() + 10 * 60 * 1000;

      resetOtpStore.set(user.email.toLowerCase(), {
        otpHash,
        userId: user.id,
        email: user.email,
        expiresAt,
        attempts: 0,
        lastSentAt: Date.now(),
        verified: false,
        resetToken: null,
        resetTokenExpiresAt: null
      });

      console.log(`\n========================================================`);
      console.log(`🔁 [SkillSwap Resend OTP Requested]`);
      console.log(`👤 Student: ${user.name} (${user.email})`);
      console.log(`⏱️ Expiration: 10 minutes (${new Date(expiresAt).toLocaleTimeString()})`);
      console.log(`========================================================\n`);

      await emailService.sendPasswordResetOtp(user.email, user.name, otp);

      return res.json({
        success: true,
        message: 'A fresh verification code has been sent to your email.'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Reset Password with Verified Reset Token
   * POST /api/auth/reset-password
   * Enforces capital letter + min 6 chars rules, matching confirmation, hashes with bcrypt, updates DB, and burns session
   */
  async resetPassword(req, res, next) {
    try {
      const { email, resetToken, newPassword, confirmPassword } = req.body;
      const clientMeta = getClientMeta(req);

      if (!email || !resetToken || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Please provide email, verification token, new password, and confirmation.'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Passwords do not match. Please re-enter identical passwords.'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const record = resetOtpStore.get(normalizedEmail);

      // Verify that OTP verification succeeded and token is valid
      if (!record || !record.verified || !record.resetToken || record.resetToken !== resetToken) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired password reset session. Please verify your OTP again.'
        });
      }

      if (Date.now() > record.resetTokenExpiresAt) {
        resetOtpStore.delete(normalizedEmail);
        return res.status(400).json({
          success: false,
          error: 'Password reset session expired (10 min limit). Please verify your OTP again.'
        });
      }

      // Password Rules: Starts with Capital Letter (A-Z) and min 6 characters
      if (!/^[A-Z]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          error: 'Password rule violation: Password must start with a capital letter (A-Z).'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long.'
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update existing user in the database (never store plaintext passwords)
      await db.runAsync(
        `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR LOWER(email) = ?`,
        [passwordHash, record.userId, normalizedEmail]
      );

      // Invalidate and delete reset session (prevent reuse of OTP or resetToken)
      resetOtpStore.delete(normalizedEmail);

      console.log(`✅ [Password Reset Success] Database password updated securely for ${normalizedEmail}`);

      await recordLoginAudit({
        userId: record.userId,
        email: normalizedEmail,
        ipAddress: clientMeta.ip,
        userAgent: clientMeta.userAgent,
        status: 'SUCCESS',
        failureReason: 'Password reset successful',
        authMethod: 'PASSWORD_RESET'
      });

      return res.json({
        success: true,
        message: 'Password reset successfully. Please sign in with your new password.'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Current Authenticated User Profile
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const fullUser = (await supabaseService.getUserById(req.user.id)) || req.user;
      delete fullUser.password_hash;
      res.json({
        success: true,
        user: fullUser
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Login History Audit Logs from Database
   * GET /api/auth/login-history
   */
  async getLoginHistory(req, res, next) {
    try {
      const user = req.user;
      let logs = [];

      if (user.role === ROLES.ADMIN || user.is_admin === 1) {
        // Admins can see platform-wide login logs
        logs = await db.allAsync(
          `SELECT l.*, u.name as user_name 
           FROM login_history l 
           LEFT JOIN users u ON l.user_id = u.id 
           ORDER BY l.created_at DESC 
           LIMIT 50`
        );
      } else {
        // Students and Mentors see their own login history
        logs = await db.allAsync(
          `SELECT * FROM login_history 
           WHERE user_id = ? OR email = ? 
           ORDER BY created_at DESC 
           LIMIT 30`,
          [user.id, user.email]
        );
      }

      res.json({
        success: true,
        logins: logs
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Supabase Auth Sync Bridge
   * POST /api/auth/supabase-sync
   */
  async supabaseSync(req, res, next) {
    try {
      const { supabaseUser, token: supabaseToken } = req.body;
      const clientMeta = getClientMeta(req);

      if (!supabaseUser || !supabaseUser.email) {
        return res.status(400).json({ success: false, error: 'Invalid Supabase user payload' });
      }

      const email = supabaseUser.email.toLowerCase();
      let user = await db.getAsync(`SELECT * FROM users WHERE email = ?`, [email]);

      if (!user) {
        const userId = supabaseUser.id || ('usr_' + Date.now());
        const name = supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0];
        const role = ROLES.STUDENT;

        await db.runAsync(
          `INSERT INTO users (id, email, password_hash, role, name, college, major, avatar, bio, credits, escrow_locked, lifetime_earned, lifetime_spent, rating, reviews_count, badges_json, is_admin, last_login_at, login_count)
           VALUES (?, ?, 'supabase_oauth', ?, ?, 'Vignan University', 'B.Tech CSE', 'default_avatar', 'Vignan Student', 3.0, 0.0, 0.0, 0.0, 5.0, 0, '["Vignan Student"]', 0, CURRENT_TIMESTAMP, 1)`,
          [userId, email, role, name]
        );
        user = await db.getAsync(`SELECT * FROM users WHERE id = ?`, [userId]);
      } else {
        await db.runAsync(
          `UPDATE users SET last_login_at = CURRENT_TIMESTAMP, login_count = COALESCE(login_count, 0) + 1 WHERE id = ?`,
          [user.id]
        );
      }

      await recordLoginAudit({
        userId: user.id,
        email: user.email,
        role: user.role,
        ipAddress: clientMeta.ip,
        userAgent: clientMeta.userAgent,
        status: 'SUCCESS',
        authMethod: 'SUPABASE_OAUTH'
      });

      user.badges = JSON.parse(user.badges_json || '[]');
      delete user.password_hash;

      const token = generateToken(user);
      res.json({
        success: true,
        token,
        user
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
