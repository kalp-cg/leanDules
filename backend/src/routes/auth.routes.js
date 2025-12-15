/**
 * Authentication Routes
 * Routes for user authentication and authorization
 */

const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { authenticateToken, authRateLimit } = require('../middlewares/auth.middleware');
const { handleValidationErrors, userValidation } = require('../utils/validators');
const { asyncHandler } = require('../middlewares/error.middleware');
const { generateTokenPair } = require('../utils/token');
const { prisma } = require('../config/db');

const router = express.Router();

// Import controllers (will be created next)
const authController = {
  signup: asyncHandler(async (req, res) => {
    const authService = require('../services/auth.service');
    const { user, tokens } = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }),

  login: asyncHandler(async (req, res) => {
    const authService = require('../services/auth.service');
    const { user, tokens } = await authService.login(req.body);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }),

  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const authService = require('../services/auth.service');
    const tokens = await authService.refreshTokens(refreshToken);
    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: tokens,
    });
  }),

  logout: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const authService = require('../services/auth.service');
      await authService.logout(refreshToken);
    }
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const authService = require('../services/auth.service');
    await authService.changePassword(req.userId, req.body);
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }),
};

// POST /api/auth/signup
router.post(
  '/signup',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  userValidation.signup,
  handleValidationErrors,
  authController.signup
);

// POST /api/auth/register (alias for signup)
router.post(
  '/register',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  userValidation.signup,
  handleValidationErrors,
  authController.signup
);

// POST /api/auth/login
router.post(
  '/login',
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  userValidation.login,
  handleValidationErrors,
  authController.login
);

// POST /api/auth/logout
router.post('/logout', authenticateToken, authController.logout);

// POST /api/auth/refresh-token
router.post(
  '/refresh-token',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ],
  handleValidationErrors,
  authController.refreshToken
);

// POST /api/auth/refresh (alias)
router.post(
  '/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ],
  handleValidationErrors,
  authController.refreshToken
);

// POST /api/auth/change-password
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword')
      .optional()
      .notEmpty()
      .withMessage('Current password is required'),
    body('oldPassword')
      .optional()
      .notEmpty()
      .withMessage('Old password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  ],
  handleValidationErrors,
  authController.changePassword
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  authRateLimit,
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const authService = require('../services/auth.service');
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  })
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  authRateLimit,
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const authService = require('../services/auth.service');
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.json(result);
  })
);

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'User profile retrieved successfully',
    data: req.user,
  });
});

// GitHub OAuth Routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  asyncHandler(async (req, res) => {
    // Successful authentication
    const user = req.user;
    
    // Generate tokens
    const tokens = generateTokenPair({ userId: user.id, email: user.email });

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Redirect to frontend with token
    // Note: In a real production app, consider using secure cookies or a temporary code exchange
    res.redirect(`http://localhost:3000/auth/callback?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  })
);

module.exports = router;