const express = require('express');
const {
  registerAdmin,
  loginAdmin,
  changePassword,
  forgotPassword,
  setPassword,
  verifyEmail,
} = require('../../controllers/auth/adminAuth.controller');
const { createCourse, listCourses, getAdminDashboard } = require('../../controllers/adminCourse.controller');
const { createSemester, listSemesters } = require('../../controllers/adminSemester.controller');
const { listAssignmentSubmissions, listAllAssignmentSubmissions } = require('../../controllers/adminAssignment.controller');
const { authMiddleware, requireRole } = require('../../middleware/auth');

const router = express.Router();

// Admin registration (protected: only admins can create other admins)
router.post('/register', registerAdmin);

// Admin login
router.post('/login', loginAdmin);

// Password reset flows
router.post('/forgot-password', forgotPassword);
router.post('/set-password', setPassword);

// Authenticated password change
router.post('/change-password', authMiddleware, changePassword);

// Email verification for admins
router.post('/verify-email', authMiddleware, requireRole('admin'), verifyEmail);

// Course management (admin only)
router.post('/courses', authMiddleware, requireRole('admin'), createCourse);
router.get('/courses', authMiddleware, requireRole('admin'), listCourses);

// Semester management (admin only)
router.post('/semesters', authMiddleware, requireRole('admin'), createSemester);
router.get('/semesters', authMiddleware, requireRole('admin'), listSemesters);

// Assignment submissions (admin only)
// All submissions across all assignments
router.get(
  '/assignments/submissions',
  authMiddleware,
  requireRole('admin'),
  listAllAssignmentSubmissions,
);

// Submissions for a specific assignment
router.get(
  '/assignments/:assignmentId/submissions',
  authMiddleware,
  requireRole('admin'),
  listAssignmentSubmissions,
);

// Admin dashboard overview
router.get('/dashboard/overview', authMiddleware, requireRole('admin'), getAdminDashboard);

module.exports = router;
