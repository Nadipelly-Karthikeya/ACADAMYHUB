const { Semester } = require('../models/Semester');
const { ApiError } = require('../utils/apiError');
const { successResponse } = require('../utils/apiResponse');

/**
 * Create a new semester.
 * Body: { name: string, startDate?: string|Date, endDate?: string|Date }
 */
async function createSemester(req, res, next) {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name) {
      throw new ApiError(400, 'name is required');
    }

    const existing = await Semester.findOne({ name: name.trim() });
    if (existing) {
      throw new ApiError(409, 'Semester with this name already exists');
    }

    const semester = await Semester.create({
      name: name.trim(),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Semester created successfully',
      data: { semester },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * List semesters with simple pagination.
 * Query: ?page=1&limit=20
 */
async function listSemesters(req, res, next) {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [semesters, total] = await Promise.all([
      Semester.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Semester.countDocuments(),
    ]);

    return successResponse(res, {
      message: 'Semesters fetched successfully',
      data: {
        items: semesters,
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
  createSemester,
  listSemesters,
};
