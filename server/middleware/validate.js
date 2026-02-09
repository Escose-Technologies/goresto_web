import { ValidationError } from '../errors/index.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(new ValidationError('Validation failed', details));
    }

    req[source] = result.data;
    next();
  };
};
