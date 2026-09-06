/**
 * Standard API Response Handlers
 */

export function successResponse(res, data = {}, message = 'Success', statusCode = 200, pagination = null) {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
}

export function errorResponse(res, error, defaultStatusCode = 500) {
  const statusCode = error.statusCode || defaultStatusCode;
  const code = error.code || 'INTERNAL_ERROR';
  const message = error.message || 'An unexpected error occurred';

  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (error.details) {
    response.error.details = error.details;
  }

  // Only attach debug stack in non-production environments
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.error.stack = error.stack;
  }

  return res.status(statusCode).json(response);
}
