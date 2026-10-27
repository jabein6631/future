/**
 * SkillSwap Platform - Vercel Serverless Express Application Handler
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSchema } = require('../backend/database/db');

// Ensure database schema tables (including signals table) exist on serverless startup
initSchema().catch(err => console.warn('Schema init notice:', err.message));

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

try {
  const { attachUserContext } = require('../backend/middleware/auth');
  app.use(attachUserContext);
} catch (err) {
  console.warn('⚠️ Auth middleware load notice:', err.message);
}

let routeLoadError = null;
try {
  const apiRoutes = require('../backend/routes');
  app.use('/api', apiRoutes);
  app.use('/', apiRoutes);
} catch (err) {
  routeLoadError = err;
  console.error('💥 API routes load error:', err);
}

const errorHandler = require('../backend/middleware/errorHandler');
app.use('/api', errorHandler);
app.use(errorHandler);

app.all('*', (req, res) => {
  if (routeLoadError) {
    return res.status(500).json({
      success: false,
      error: 'Backend API routes failed to initialize: ' + routeLoadError.message,
      stack: routeLoadError.stack
    });
  }
  res.status(404).json({ success: false, error: 'API route not found: ' + req.originalUrl });
});


module.exports = app;
