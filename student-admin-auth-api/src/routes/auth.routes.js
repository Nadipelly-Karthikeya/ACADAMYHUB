const express = require('express');
const {
  registerStudent,
  registerAdmin,
  login,
  refreshToken,
  getProfile,
} = require('../controllers/auth.controller');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public auth routes
router.post('/student/register', registerStudent);
router.post('/admin/register', authMiddleware, requireRole('admin'), registerAdmin);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected profile route
router.get('/me', authMiddleware, getProfile);

module.exports = router;
