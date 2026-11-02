/**
 * SkillSwap Platform - Notification & Centralized Sidebar Badge Routes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// Flexible auth: accepts Bearer JWT token if present, or resolves persona from x-user-id
const flexibleNotificationAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  if (authHeader) {
    return authenticateToken(req, res, (err) => {
      if (err) {
        // Fall back gracefully to x-user-id
        req.currentUserId = req.headers['x-user-id'] || 'sri';
      }
      next();
    });
  }
  req.currentUserId = req.headers['x-user-id'] || 'sri';
  next();
};

router.use(flexibleNotificationAuth);

// Centralized dynamic sidebar badge counts
router.get('/sidebar-counts', notificationController.getSidebarCounts);

// User notifications management
router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.post('/mark-read', notificationController.markAllRead);
router.post('/:id/mark-read', notificationController.markNotificationRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
