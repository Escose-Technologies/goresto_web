import { verifyAccessToken } from '../utils/jwt.js';
import { AuthenticationError } from '../errors/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Use JWT claims directly — token is short-lived (15min) and contains all needed fields.
    // This avoids a DB query on every authenticated request.
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      restaurantId: decoded.restaurantId,
    };

    next();
  } catch (err) {
    if (err instanceof AuthenticationError) {
      next(err);
    } else {
      next(new AuthenticationError('Invalid or expired token'));
    }
  }
};
