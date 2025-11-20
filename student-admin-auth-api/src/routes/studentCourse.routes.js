const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  getMyCourses,
  getMyCourseDetails,
  getMyCoursesOverview,
} = require('../controllers/studentCourse.controller');
const { uploadPdf, savePdfToGridFS } = require('../config/gridfs');
const { Assignment } = require('../models/Assignment');
const { AssignmentSubmission } = require('../models/AssignmentSubmission');

const router = express.Router();

// All routes below are for authenticated students only
router.use(authMiddleware, requireRole('student'));

// Get list of courses assigned to the logged-in student
// GET /api/v1/student/courses
router.get('/student/courses', getMyCourses);

// Get overview numbers (total courses, assignments, notes, exams)
// GET /api/v1/student/courses/overview
router.get('/student/courses/overview', getMyCoursesOverview);

// Get single course details with assignments, exams, notes
// GET /api/v1/student/courses/:courseId
router.get('/student/courses/:courseId', getMyCourseDetails);

// Submit assignment PDF (student side)
// POST /api/v1/student/courses/:courseId/assignments/:assignmentId/submissions
router.post(
  '/student/courses/:courseId/assignments/:assignmentId/submissions',
  uploadPdf.single('file'), // student uploads PDF as 'file'
  savePdfToGridFS,          // save to GridFS and set req.fileId
  async (req, res, next) => {
    try {
      const { courseId, assignmentId } = req.params;

      if (!req.fileId) {
        return res.status(500).json({ message: 'Assignment file failed to upload' });
      }

      // Ensure assignment exists and belongs to the specified course
      const assignment = await Assignment.findOne({ _id: assignmentId, courseId });
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found for this course' });
      }

      const studentId = req.user._id;

      // Check if the student has already submitted; if yes, treat this as resubmission
      let submission = await AssignmentSubmission.findOne({ assignmentId, studentId });

      if (submission) {
        submission.fileId = req.fileId;
        submission.submittedAt = new Date();
        await submission.save();

        return res.status(200).json({
          message: 'Assignment resubmitted successfully',
          submission,
        });
      }

      submission = await AssignmentSubmission.create({
        assignmentId,
        courseId,
        studentId,
        fileId: req.fileId,
      });

      return res.status(201).json({
        message: 'Assignment submitted successfully',
        submission,
      });
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
