const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { env } = require('../config/env');
const { successResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');

function generateTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

async function register(req, res, next, role = 'student') {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const user = await User.create({ name, email, password, role });
    const tokens = generateTokens(user);

    return successResponse(res, {
      statusCode: 201,
      message: `${role} registered successfully`,
      data: { user, ...tokens },
    });
  } catch (err) {
    return next(err);
  }
}

async function registerStudent(req, res, next) {
  return register(req, res, next, 'student');
}

async function registerAdmin(req, res, next) {
  return register(req, res, next, 'admin');
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const tokens = generateTokens(user);

    return successResponse(res, {
      message: 'Logged in successfully',
      data: { user, ...tokens },
    });
  } catch (err) {
    return next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const payload = jwt.verify(incomingToken, env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    const tokens = generateTokens(user);

    return successResponse(res, {
      message: 'Token refreshed successfully',
      data: { user, ...tokens },
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Refresh token expired'));
    }
    return next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    return successResponse(res, {
      message: 'Profile fetched successfully',
      data: { user: req.user },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registerStudent,
  registerAdmin,
  login,
  refreshToken,
  getProfile,
};
