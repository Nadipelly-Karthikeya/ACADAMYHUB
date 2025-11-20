const { logger } = require('../config/logger');
const { ApiError } = require('../utils/apiError');
const { errorResponse } = require('../utils/apiResponse');

function notFoundHandler(req, res, next) {
  return errorResponse(res, { statusCode: 404, message: `Route ${req.originalUrl} not found` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError && err.statusCode ? err.statusCode : 500;
  const message = err.message || 'Internal server error';

  logger.error('Request error', {
    statusCode,
    message,
    stack: err.stack,
  });

  return errorResponse(res, { statusCode, message, errors: err.errors || null });
}

module.exports = { notFoundHandler, errorHandler };
