const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const Exam = mongoose.model('Exam', examSchema);

module.exports = { Exam };
