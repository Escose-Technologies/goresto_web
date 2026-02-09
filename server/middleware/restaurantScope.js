import { prisma } from '../config/database.js';
import { AuthorizationError, NotFoundError } from '../errors/index.js';

export const restaurantScope = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return next(new NotFoundError('Restaurant'));
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return next(new NotFoundError('Restaurant'));
    }

    // SuperAdmin can access any restaurant
    if (req.user.role === 'superadmin') {
      req.restaurant = restaurant;
      return next();
    }

    // Restaurant admin can only access their own restaurant
    if (req.user.restaurantId !== restaurantId && restaurant.adminId !== req.user.id) {
      return next(new AuthorizationError('You do not have access to this restaurant'));
    }

    req.restaurant = restaurant;
    next();
  } catch (err) {
    next(err);
  }
};
