import { prisma } from '../config/database.js';
import { comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '../utils/jwt.js';
import { AuthenticationError } from '../errors/index.js';
import { formatUser } from '../utils/formatters.js';

export const login = async (email, password, role) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  if (user.role !== role) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Check restaurant status for restaurant_admin users
  if (user.role === 'restaurant_admin') {
    const restaurant = await prisma.restaurant.findFirst({
      where: { OR: [{ adminId: user.id }, ...(user.restaurantId ? [{ id: user.restaurantId }] : [])] },
      select: { status: true },
    });
    if (!restaurant) {
      throw new AuthenticationError('No restaurant associated with this account');
    }
    if (restaurant.status === 'pending') {
      throw new AuthenticationError('Your restaurant registration is pending approval');
    }
    if (restaurant.status === 'rejected') {
      throw new AuthenticationError('Your restaurant registration has been rejected');
    }
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
  });

  const refreshToken = await generateRefreshToken(user.id);

  return {
    user: formatUser(user),
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshTokenValue) => {
  const stored = await verifyRefreshToken(refreshTokenValue);

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) {
    throw new AuthenticationError('User no longer exists');
  }

  // Rotate: delete old token, create new pair
  await revokeRefreshToken(refreshTokenValue);

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
  });

  const newRefreshToken = await generateRefreshToken(user.id);

  return { accessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshTokenValue) => {
  await revokeRefreshToken(refreshTokenValue);
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthenticationError('User not found');
  }
  return formatUser(user);
};
