const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

module.exports = { AssignmentSubmission };
