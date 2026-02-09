import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { AuthenticationError } from '../errors/index.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });
};

export const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString('hex');

  const expiresAt = new Date();
  const days = parseInt(env.JWT_REFRESH_EXPIRY) || 7;
  expiresAt.setDate(expiresAt.getDate() + days);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

export const verifyRefreshToken = async (token) => {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored) {
    throw new AuthenticationError('Invalid refresh token');
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new AuthenticationError('Refresh token expired');
  }

  return stored;
};

export const revokeRefreshToken = async (token) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

export const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};
