const { Course } = require('../models/Course');
const { User } = require('../models/User');
const { Semester } = require('../models/Semester');
const { ApiError } = require('../utils/apiError');
const { successResponse } = require('../utils/apiResponse');

/**
 * Create a new course and assign it to students by email.
 * Only admins should be able to hit this route (enforced in routes via requireRole('admin')).
 *
 * Body: {
 *   courseName: string,
 *   studentEmails: string[],
 *   semesterId?: string
 * }
 */
async function createCourse(req, res, next) {
  try {
    const { courseName, studentEmails, semesterId } = req.body;

    if (!courseName) {
      throw new ApiError(400, 'courseName is required');
    }

    if (!Array.isArray(studentEmails) || studentEmails.length === 0) {
      throw new ApiError(400, 'studentEmails must be a non-empty array of emails');
    }

    // Validate semester if provided
    let semester = null;
    if (semesterId) {
      semester = await Semester.findById(semesterId);
      if (!semester) {
        throw new ApiError(400, 'Invalid semesterId');
      }
    }

    // Normalize emails and fetch students
    const normalizedEmails = studentEmails.map((e) => String(e).toLowerCase().trim());

    const students = await User.find({
      email: { $in: normalizedEmails },
      role: 'student',
      isActive: true,
    });

    if (students.length === 0) {
      throw new ApiError(400, 'No active students found for the provided emails');
    }

    const foundEmails = new Set(students.map((s) => s.email));
    const missingEmails = normalizedEmails.filter((e) => !foundEmails.has(e));

    const course = await Course.create({
      name: courseName,
      students: students.map((s) => s._id),
      createdBy: req.user._id,
      semester: semester ? semester._id : null,
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Course created successfully',
      data: {
        course,
        assignedStudentCount: students.length,
        missingStudentEmails: missingEmails,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ApiError(409, 'Course with this name already exists'));
    }
    return next(err);
  }
}

/**
 * Get list of courses for admin.
 * Optional query params for simple pagination: ?page=1&limit=10
 */
async function listCourses(req, res, next) {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find()
        .populate('students', 'name email role')
        .populate('semester', 'name startDate endDate')
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(),
    ]);

    return successResponse(res, {
      message: 'Courses fetched successfully',
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
 * Admin overview dashboard.
 * Returns aggregate counts.
 */
async function getAdminDashboard(req, res, next) {
  try {
    const [totalStudents, totalCourses, totalSemesters] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Semester.countDocuments(),
    ]);

    return successResponse(res, {
      message: 'Admin dashboard overview fetched successfully',
      data: {
        totalStudents,
        totalCourses,
        totalSemesters,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createCourse,
  listCourses,
  getAdminDashboard,
};
