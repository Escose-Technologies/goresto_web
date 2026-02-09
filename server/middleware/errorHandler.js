import { AppError } from '../errors/AppError.js';
import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, _next) => {
  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details = undefined;

  // Operational errors (our custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }

  // Prisma unique constraint violation
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      code = 'CONFLICT';
      const fields = err.meta?.target || [];
      message = `A record with this ${Array.isArray(fields) ? fields.join(', ') : 'value'} already exists`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = 'Record not found';
    } else {
      statusCode = 400;
      code = 'DATABASE_ERROR';
      message = 'Database operation failed';
    }
  }

  // Prisma validation error
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid data provided';
  }

  // JSON parse error
  else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    code = 'PARSE_ERROR';
    message = 'Invalid JSON in request body';
  }

  // Log 500 errors
  if (statusCode === 500) {
    console.error('Unhandled error:', err);
  }

  const response = {
    success: false,
    error: { code, message },
  };

  if (details) {
    response.error.details = details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
