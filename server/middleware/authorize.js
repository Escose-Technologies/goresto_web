import { AuthorizationError } from '../errors/index.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError(`Role '${req.user.role}' is not authorized for this action`));
    }

    next();
  };
};
