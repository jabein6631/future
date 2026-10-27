/**
 * SkillSwap Platform - Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/resend-reset-otp', authController.resendResetOtp);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticateToken, authController.getMe);
router.get('/login-history', authenticateToken, authController.getLoginHistory);
router.post('/supabase-sync', authController.supabaseSync);

module.exports = router;
