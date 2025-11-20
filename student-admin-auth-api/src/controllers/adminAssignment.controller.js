const mongoose = require('mongoose');
const { AssignmentSubmission } = require('../models/AssignmentSubmission');
const { Assignment } = require('../models/Assignment');
const { ApiError } = require('../utils/apiError');
const { successResponse } = require('../utils/apiResponse');

/**
 * List submissions for a given assignment (admin only).
 * GET /api/v1/auth/admin/assignments/:assignmentId/submissions
 * Optional query params: ?page=1&limit=20
 */
async function listAssignmentSubmissions(req, res, next) {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw new ApiError(400, 'Invalid assignmentId');
    }

    const assignment = await Assignment.findById(assignmentId).populate('courseId', 'name');
    if (!assignment) {
      throw new ApiError(404, 'Assignment not found');
    }

    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      AssignmentSubmission.find({ assignmentId })
        .populate('studentId', 'name email role')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      AssignmentSubmission.countDocuments({ assignmentId }),
    ]);

    return successResponse(res, {
      message: 'Assignment submissions fetched successfully',
      data: {
        assignment,
        items: submissions,
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
 * List all assignment submissions from all students (admin only).
 * GET /api/v1/auth/admin/assignments/submissions
 * Optional query params: ?page=1&limit=20&courseId=&studentId=&assignmentId=
 */
async function listAllAssignmentSubmissions(req, res, next) {
  try {
    const { courseId, studentId, assignmentId } = req.query;

    const filter = {};

    if (assignmentId) {
      if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        throw new ApiError(400, 'Invalid assignmentId');
      }
      filter.assignmentId = assignmentId;
    }

    if (courseId) {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new ApiError(400, 'Invalid courseId');
      }
      filter.courseId = courseId;
    }

    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new ApiError(400, 'Invalid studentId');
      }
      filter.studentId = studentId;
    }

    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      AssignmentSubmission.find(filter)
        .populate('studentId', 'name email role')
        .populate({
          path: 'assignmentId',
          select: 'title courseId dueDate',
          populate: { path: 'courseId', select: 'name' },
        })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      AssignmentSubmission.countDocuments(filter),
    ]);

    return successResponse(res, {
      message: 'All assignment submissions fetched successfully',
      data: {
        items: submissions,
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

module.exports = {
  listAssignmentSubmissions,
  listAllAssignmentSubmissions,
};
