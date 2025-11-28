/**
 * Authentication Service
 * Business logic for user authentication and authorization
 */

const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const { generateTokenPair } = require('../utils/token');
const config = require('../config/env');
const { createError } = require('../middlewares/error.middleware');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @returns {Promise<Object>} User data and tokens
 */
async function signup(userData) {
  const { username, email, password } = userData;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw createError.conflict('Email already registered');
      } else {
        throw createError.conflict('Username already taken');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        reputation: true,
        followersCount: true,
        followingCount: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    return {
      user,
      tokens,
    };
  } catch (error) {
    console.error('Detailed signup error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      meta: error.meta,
    });
    
    if (error.isOperational) {
      throw error;
    }
    throw createError.internal('Failed to create account');
  }
}

/**
 * Authenticate user login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} User data and tokens
 */
async function login(credentials) {
  const { email, password } = credentials;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw createError.forbidden('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Login error:', error);
    throw createError.internal('Login failed');
  }
}

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
async function refreshTokens(refreshToken) {
  try {
    const { verifyRefreshToken } = require('../utils/token');
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw createError.unauthorized('Invalid refresh token');
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw createError.unauthorized('User not found or deactivated');
    }

    // Generate new tokens
    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    return tokens;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Token refresh error:', error);
    throw createError.unauthorized('Token refresh failed');
  }
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {Object} passwordData - Password change data
 * @returns {Promise<boolean>} Success status
 */
async function changePassword(userId, passwordData) {
  const { currentPassword, newPassword } = passwordData;

  try {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw createError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    console.error('Password change error:', error);
    throw createError.internal('Failed to change password');
  }
}

/**
 * Verify user email (placeholder for email verification)
 * @param {string} token - Verification token
 * @returns {Promise<boolean>} Verification status
 */
async function verifyEmail(token) {
  // TODO: Implement email verification logic
  throw createError.internal('Email verification not implemented yet');
}

/**
 * Request password reset (placeholder)
 * @param {string} email - User email
 * @returns {Promise<boolean>} Request status
 */
async function requestPasswordReset(email) {
  // TODO: Implement password reset logic
  throw createError.internal('Password reset not implemented yet');
}

module.exports = {
  signup,
  login,
  refreshTokens,
  changePassword,
  verifyEmail,
  requestPasswordReset,
};