/**
 * SkillSwap Platform - Support Team & Doubt Classification Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const supportController = require('../controllers/supportController');
const { authenticateToken } = require('../middleware/auth');

// Multer memory storage for robust binary file uploads (zero base64 payload bloat)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

const optionalUpload = (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  console.log('OPTIONAL_UPLOAD_CHECK:', { ct, url: req.originalUrl || req.url });
  if (ct.includes('multipart/form-data') || req.is('multipart/*')) {
    return upload.any()(req, res, (err) => {
      console.log('MULTER_RESULT:', { err: err?.message, filesCount: req.files?.length, bodyKeys: Object.keys(req.body || {}) });
      if (err) return next(err);
      next();
    });
  }
  next();
};

// Public / Browser-accessible Attachment Download & Inline View Endpoints
router.get('/attachments/:id/download', supportController.downloadAttachment);
router.get('/attachments/:id/view', supportController.viewAttachment);
router.get('/attachments/:id', supportController.viewAttachment);
router.get('/doubts/:doubtId/attachments/:attachmentId/download', supportController.downloadAttachment);

// All other support routes are protected by JWT authentication
router.use(authenticateToken);

// Support Gatekeeper & Dynamic KPI Stats & Subjects
router.get('/eligibility', supportController.getEligibilityStatus);
router.get('/stats', supportController.getSupportStats);
router.get('/subjects', supportController.getSupportSubjects);

// Shared Support Doubts (First-Come-First-Served Hub)
router.get('/doubts', supportController.getAllDoubts);
router.get('/doubts/:id', supportController.getDoubtById);
router.post('/doubts', optionalUpload, supportController.createDoubt);
router.post('/doubts/:id/accept', supportController.acceptDoubt);
router.post('/doubts/:id/answer', optionalUpload, supportController.answerDoubt);
router.post('/doubts/:id/rate', supportController.rateDoubt);
router.get('/doubts/:doubtId/attachments/:attachmentId/view', supportController.viewAttachment);

// Backward-Compatibility Aliases
router.get('/tickets', supportController.getAllTickets);
router.get('/tickets/:id', supportController.getTicketById);
router.post('/tickets', optionalUpload, supportController.createTicket);
router.post('/tickets/:id/claim', supportController.claimTicket);
router.post('/tickets/:id/resolve', optionalUpload, supportController.resolveTicket);
router.post('/tickets/:id/rate', supportController.rateTicket);

// Direct root endpoints (when mounted at /tickets or /doubts)
router.get('/', supportController.getAllDoubts);
router.post('/', optionalUpload, supportController.createDoubt);
router.get('/:id', supportController.getDoubtById);

module.exports = router;
