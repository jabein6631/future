const express = require('express');
const router = express.Router();
const codelabController = require('../controllers/codelabController');

router.post('/execute', codelabController.executeCode);

module.exports = router;

