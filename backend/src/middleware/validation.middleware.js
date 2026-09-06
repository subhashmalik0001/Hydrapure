import { ValidationError } from '../utils/errors.js';

/**
 * Express middleware helper to validate request data against Zod schemas
 */
export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = await schema.parseAsync(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formatted = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError('Validation failed for request parameters', formatted));
      } else {
        next(new ValidationError(err.message));
      }
    }
  };
}

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');
