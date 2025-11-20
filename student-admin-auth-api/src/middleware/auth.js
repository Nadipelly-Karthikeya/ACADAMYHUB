const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { User } = require('../models/User');
const { ApiError } = require('../utils/apiError');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token missing');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token expired'));
    }
    if (err instanceof ApiError) {
      return next(err);
    }
    return next(new ApiError(401, 'Invalid authentication token'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: insufficient permissions'));
    }
    return next();
  };
}

module.exports = { authMiddleware, requireRole };
