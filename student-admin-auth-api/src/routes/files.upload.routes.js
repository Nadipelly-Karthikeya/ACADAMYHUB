const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { uploadPdf, savePdfToGridFS } = require('../config/gridfs');

const router = express.Router();

// Generic admin-only file upload to GridFS
// POST /api/v1/files/upload
router.post(
  '/upload',
  authMiddleware,
  requireRole('admin'),
  uploadPdf.single('file'), // multer stores file in memory
  savePdfToGridFS,          // uploads file to GridFS and sets req.fileId
  (req, res) => {
    if (!req.fileId) {
      return res.status(500).json({ message: 'File failed to upload' });
    }

    return res.status(201).json({ fileId: req.fileId });
  }
);

module.exports = router;
