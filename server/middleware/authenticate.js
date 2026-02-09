import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/database.js';
import { AuthenticationError } from '../errors/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, restaurantId: true },
    });

    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AuthenticationError) {
      next(err);
    } else {
      next(new AuthenticationError('Invalid or expired token'));
    }
  }
};
