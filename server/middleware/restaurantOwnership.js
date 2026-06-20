import { prisma } from '../config/database.js';
import { AuthorizationError, NotFoundError } from '../errors/index.js';

/**
 * Ownership guard for restaurant routes keyed on the `:id` param.
 *
 * `restaurantScope` covers nested routes that use `:restaurantId`; this is its
 * sibling for `/restaurants/:id`, where `PATCH`/`GET` previously ran with only
 * `authenticate` and no ownership check (any restaurant admin could read or
 * edit any restaurant by id). SuperAdmins bypass the check.
 */
export const restaurantOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(new NotFoundError('Restaurant'));

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: { id: true, adminId: true },
    });
    if (!restaurant) return next(new NotFoundError('Restaurant'));

    if (
      req.user.role !== 'superadmin' &&
      req.user.restaurantId !== id &&
      restaurant.adminId !== req.user.id
    ) {
      return next(new AuthorizationError('You do not have access to this restaurant'));
    }

    next();
  } catch (err) {
    next(err);
  }
};
