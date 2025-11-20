const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { uploadPdf, getUploadsBucket,savePdfToGridFS } = require('../config/gridfs');
const { Note } = require('../models/Note');
const { Assignment } = require('../models/Assignment');
const { Exam } = require('../models/Exam');

const router = express.Router();

// ---- NOTES ----

// Upload note PDF for a course
router.post(
  '/courses/:courseId/notes',
  authMiddleware,
  requireRole('admin'),
  uploadPdf.single('file'),     // multer stores file in memory
  savePdfToGridFS,              // uploads file to GridFS and sets req.fileId
  async (req, res, next) => {
    try {
      const { title, unit } = req.body;
      const { courseId } = req.params;

      if (!req.fileId) {
        return res.status(500).json({ message: 'File failed to upload' });
      }

      const note = await Note.create({
        courseId,
        title,
        unit,
        fileId: req.fileId,   // GridFS file ID
      });

      return res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  }
);


// Get all notes for a course (metadata + download URL)
router.get('/courses/:courseId/notes', authMiddleware, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const notes = await Note.find({ courseId }).sort({ createdAt: -1 });

    const withUrls = notes.map((n) => ({
      ...n.toObject(),
      fileUrl: `/api/v1/courses/${courseId}/notes/${n._id}/file`,
    }));

    return res.json(withUrls);
  } catch (err) {
    return next(err);
  }
});

// Stream note PDF
router.get('/courses/:courseId/notes/:noteId/file', authMiddleware, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const bucket = getUploadsBucket();
    res.set('Content-Type', 'application/pdf');

    bucket
      .openDownloadStream(note.fileId)
      .on('error', (err) => next(err))
      .pipe(res);
  } catch (err) {
    return next(err);
  }
});

// ---- ASSIGNMENTS ----

// Upload assignment with PDF
router.post(
  '/courses/:courseId/assignments',
  authMiddleware,
  requireRole('admin'),
  uploadPdf.single('attachment'),     // multer stores file in memory
  savePdfToGridFS,                    // uploads file to GridFS and sets req.fileId
  async (req, res, next) => {
    try {
      if (!req.fileId) {
        return res.status(500).json({ message: 'PDF attachment failed to upload' });
      }

      const { title, description, dueDate } = req.body;
      const { courseId } = req.params;

      const assignment = await Assignment.create({
        courseId,
        title,
        description,
        dueDate,
        attachmentFileId: req.fileId,   // GridFS file ID
      });

      return res.status(201).json(assignment);
    } catch (err) {
      return next(err);
    }
  },
);

// Get assignments for a course
router.get('/courses/:courseId/assignments', authMiddleware, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ courseId }).sort({ createdAt: -1 });

    const withUrls = assignments.map((a) => ({
      ...a.toObject(),
      attachmentUrl: `/api/v1/courses/${courseId}/assignments/${a._id}/attachment`,
    }));

    return res.json(withUrls);
  } catch (err) {
    return next(err);
  }
});

// Stream assignment attachment PDF
router.get(
  '/courses/:courseId/assignments/:assignmentId/attachment',
  authMiddleware,
  async (req, res, next) => {
    try {
      const assignment = await Assignment.findById(req.params.assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      const bucket = getUploadsBucket();
      res.set('Content-Type', 'application/pdf');

      bucket
        .openDownloadStream(assignment.attachmentFileId)
        .on('error', (err) => next(err))
        .pipe(res);
    } catch (err) {
      return next(err);
    }
  },
);

// ---- EXAMS ----

// Create exam (no file, just metadata)
router.post(
  '/courses/:courseId/exams',
  authMiddleware,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { type, instructions, dueDate } = req.body;
      const { courseId } = req.params;

      const exam = await Exam.create({
        courseId,
        type,
        instructions,
        dueDate,
      });

      return res.status(201).json(exam);
    } catch (err) {
      return next(err);
    }
  },
);

// Get exams for a course
router.get('/courses/:courseId/exams', authMiddleware, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const exams = await Exam.find({ courseId }).sort({ createdAt: -1 });
    return res.json(exams);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
