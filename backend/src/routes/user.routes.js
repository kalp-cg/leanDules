/**
 * User Routes
 * Routes for user profile management and social features
 */

const express = require('express');
const { param, query } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');
const { handleValidationErrors, userValidation, commonValidation } = require('../utils/validators');
const { asyncHandler } = require('../middlewares/error.middleware');

const router = express.Router();

// Import user service
const userService = require('../services/user.service');

// Placeholder controllers
const userController = {
  getAllUsers: asyncHandler(async (req, res) => {
    const { page, limit, search, sortBy } = req.query;
    const result = await userService.getAllUsers(req.userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      sortBy,
    });
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: result.pagination,
    });
  }),

  getProfile: asyncHandler(async (req, res) => {
    const profile = await userService.getUserProfile(req.userId);
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
    });
  }),

  getUserById: asyncHandler(async (req, res) => {
    const profile = await userService.getUserProfile(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: profile,
    });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateProfile(req.userId, req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  }),

  followUser: asyncHandler(async (req, res) => {
    await userService.followUser(req.userId, req.params.id);
    res.json({
      success: true,
      message: 'User followed successfully',
    });
  }),

  unfollowUser: asyncHandler(async (req, res) => {
    await userService.unfollowUser(req.userId, req.params.id);
    res.json({
      success: true,
      message: 'User unfollowed successfully',
    });
  }),

  getFollowers: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await userService.getFollowers(req.params.id, { page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
    res.json({
      success: true,
      message: 'Followers retrieved successfully',
      data: result.followers,
      pagination: result.pagination,
    });
  }),

  getFollowing: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await userService.getFollowing(req.params.id, { page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
    res.json({
      success: true,
      message: 'Following list retrieved successfully',
      data: result.following,
      pagination: result.pagination,
    });
  }),

  searchUsers: asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;
    const result = await userService.searchUsers(q, { page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
    res.json({
      success: true,
      message: 'User search completed successfully',
      data: result.users,
      pagination: result.pagination,
    });
  }),
};
// GET /api/users - Get all users (for finding friends)
router.get(
  '/',
  authenticateToken,
  [
    query('search').optional().isString(),
    query('sortBy').optional().isIn(['newest', 'rating', 'xp']),
    ...commonValidation.pagination,
  ],
  handleValidationErrors,
  userController.getAllUsers
);
// GET /api/users/me - Get current user profile
router.get('/me', authenticateToken, userController.getProfile);

// PUT /api/users/update - Update current user profile
router.put(
  '/update',
  authenticateToken,
  userValidation.updateProfile,
  handleValidationErrors,
  userController.updateProfile
);

// GET /api/users/me/followers - Get current user's followers
router.get(
  '/me/followers',
  authenticateToken,
  [...commonValidation.pagination],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await userService.getFollowers(req.userId, { page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
    res.json({
      success: true,
      message: 'Followers retrieved successfully',
      data: result.followers,
      pagination: result.pagination,
    });
  })
);

// GET /api/users/me/following - Get users current user is following
router.get(
  '/me/following',
  authenticateToken,
  [...commonValidation.pagination],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await userService.getFollowing(req.userId, { page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
    res.json({
      success: true,
      message: 'Following list retrieved successfully',
      data: result.following,
      pagination: result.pagination,
    });
  })
);

// GET /api/users/search - Search users
router.get(
  '/search',
  optionalAuth,
  [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
    ...commonValidation.pagination,
  ],
  handleValidationErrors,
  userController.searchUsers
);

// GET /api/users/:id - Get user profile by ID
router.get(
  '/:id',
  optionalAuth,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid user ID is required'),
  ],
  handleValidationErrors,
  userController.getUserById
);

// POST /api/users/:id/follow - Follow a user
router.post(
  '/:id/follow',
  authenticateToken,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid user ID is required'),
  ],
  handleValidationErrors,
  userController.followUser
);

// DELETE /api/users/:id/follow - Unfollow a user
router.delete(
  '/:id/follow',
  authenticateToken,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid user ID is required'),
  ],
  handleValidationErrors,
  userController.unfollowUser
);

// GET /api/users/:id/followers - Get user's followers
router.get(
  '/:id/followers',
  optionalAuth,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid user ID is required'),
    ...commonValidation.pagination
  ],
  handleValidationErrors,
  userController.getFollowers
);

// GET /api/users/:id/following - Get users that user is following
router.get(
  '/:id/following',
  optionalAuth,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid user ID is required'),
    ...commonValidation.pagination
  ],
  handleValidationErrors,
  userController.getFollowing
);

module.exports = router;