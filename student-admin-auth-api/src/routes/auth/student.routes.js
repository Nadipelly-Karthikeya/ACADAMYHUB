const express = require('express');
const {
  registerStudent,
  loginStudent,
  forgotPassword,
  setPassword,
  changePassword,
  verifyEmail,
} = require('../../controllers/auth/studentAuth.controller');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

// Student registration and login
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Password reset flows
router.post('/forgot-password', forgotPassword);
router.post('/set-password', setPassword);

// Authenticated password change
router.post('/change-password', authMiddleware, changePassword);

// Email verification after first-time registration
router.post('/verify-email',authMiddleware, verifyEmail);

module.exports = router;
