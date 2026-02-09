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
