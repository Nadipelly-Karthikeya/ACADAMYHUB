const mongoose = require('mongoose');
const { Course } = require('../models/Course');
const { Assignment } = require('../models/Assignment');
const { Exam } = require('../models/Exam');
const { Note } = require('../models/Note');
const { ApiError } = require('../utils/apiError');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get list of courses assigned to the logged‑in student.
 * GET /api/v1/student/courses
 * Optional query: ?page=1&limit=20
 */
async function getMyCourses(req, res, next) {
  try {
    const studentId = req.user && req.user._id;
    if (!studentId || req.user.role !== 'student') {
      throw new ApiError(403, 'Only students can access their courses');
    }

    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find({ students: studentId })
        .populate('semester', 'name startDate endDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments({ students: studentId }),
    ]);

    return successResponse(res, {
      message: 'Student courses fetched successfully',
      data: {
        items: courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Get details of a single course assigned to the student, including
 * assignments, exams and notes.
 * GET /api/v1/student/courses/:courseId
 */
async function getMyCourseDetails(req, res, next) {
  try {
    const studentId = req.user && req.user._id;
    if (!studentId || req.user.role !== 'student') {
      throw new ApiError(403, 'Only students can access course details');
    }

    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new ApiError(400, 'Invalid courseId');
    }

    const course = await Course.findOne({ _id: courseId, students: studentId })
      .populate('semester', 'name startDate endDate')
      .populate('createdBy', 'name email role');

    if (!course) {
      throw new ApiError(404, 'Course not found for this student');
    }

    const [assignments, exams, notes] = await Promise.all([
      Assignment.find({ courseId }).sort({ createdAt: -1 }),
      Exam.find({ courseId }).sort({ createdAt: -1 }),
      Note.find({ courseId }).sort({ createdAt: -1 }),
    ]);

    // Attach download URLs, reusing existing courseContent routes.
    const courseIdStr = course._id.toString();

    const assignmentsWithUrls = assignments.map((a) => ({
      ...a.toObject(),
      attachmentUrl: `/api/v1/courses/${courseIdStr}/assignments/${a._id}/attachment`,
    }));

    const notesWithUrls = notes.map((n) => ({
      ...n.toObject(),
      fileUrl: `/api/v1/courses/${courseIdStr}/notes/${n._id}/file`,
    }));

    return successResponse(res, {
      message: 'Course details fetched successfully',
      data: {
        course,
        assignments: assignmentsWithUrls,
        exams,
        notes: notesWithUrls,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Get overview numbers for the student: total courses, total assignments,
 * total notes, total exams across all assigned courses.
 * GET /api/v1/student/courses/overview
 */
async function getMyCoursesOverview(req, res, next) {
  try {
    const studentId = req.user && req.user._id;
    if (!studentId || req.user.role !== 'student') {
      throw new ApiError(403, 'Only students can access course overview');
    }

    const courses = await Course.find({ students: studentId }).select('_id');
    const courseIds = courses.map((c) => c._id);

    if (courseIds.length === 0) {
      return successResponse(res, {
        message: 'Student course overview fetched successfully',
        data: {
          totalCourses: 0,
          totalAssignments: 0,
          totalNotes: 0,
          totalExams: 0,
        },
      });
    }

    const [totalAssignments, totalNotes, totalExams] = await Promise.all([
      Assignment.countDocuments({ courseId: { $in: courseIds } }),
      Note.countDocuments({ courseId: { $in: courseIds } }),
      Exam.countDocuments({ courseId: { $in: courseIds } }),
    ]);

    return successResponse(res, {
      message: 'Student course overview fetched successfully',
      data: {
        totalCourses: courseIds.length,
        totalAssignments,
        totalNotes,
        totalExams,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getMyCourses,
  getMyCourseDetails,
  getMyCoursesOverview,
};
