/**
 * Authentication Service - New Schema
 * Handles user registration, login, and token management
 */

const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const { generateTokenPair } = require('../utils/token');
const config = require('../config/env');
const { createError } = require('../middlewares/error.middleware');

/**
 * Register a new user
 */
async function register(userData) {
  const { fullName, email, password } = userData;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError.conflict('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        rating: true,
        createdAt: true,
      },
    });

    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, tokens };
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to create account');
  }
}

/**
 * Login user
 */
async function login(credentials) {
  const { email, password } = credentials;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError.unauthorized('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw createError.unauthorized('Invalid email or password');
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  } catch (error) {
    console.error('Login error details:', error);
    if (error.isOperational) throw error;
    throw createError.internal('Login failed');
  }
}

/**
 * Refresh access token
 */
async function refreshTokens(refreshToken) {
  try {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw createError.unauthorized('Invalid refresh token');
    }

    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw createError.unauthorized('Refresh token expired');
    }

    const tokens = generateTokenPair({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });

    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Token refresh failed');
  }
}

/**
 * Logout user
 */
async function logout(refreshToken) {
  try {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    return { success: true };
  } catch (error) {
    throw createError.internal('Logout failed');
  }
}

/**
 * Create session record
 */
async function createSession(userId, ipAddress, userAgent) {
  try {
    return await prisma.session.create({
      data: { userId, ipAddress, userAgent },
    });
  } catch (error) {
    console.error('Session creation error:', error);
  }
}

/**
 * Change user password
 */
async function changePassword(userId, passwordData) {
  // Support both 'currentPassword' and 'oldPassword' field names
  const currentPassword = passwordData.currentPassword || passwordData.oldPassword;
  const { newPassword } = passwordData;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw createError.unauthorized('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all refresh tokens for security
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { success: true };
  } catch (error) {
    if (error.isOperational) throw error;
    throw createError.internal('Failed to change password');
  }
}

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  createSession,
  changePassword,
};
