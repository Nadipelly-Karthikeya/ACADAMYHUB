const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = { Semester };
