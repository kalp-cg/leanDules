/**
 * User Controller
 * Handles user profile management including image uploads
 */

const userService = require('../services/user.service');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * Get all users with pagination and search
 */
const getAllUsers = asyncHandler(async (req, res) => {
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
});

/**
 * Get current user's profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfile(req.userId);
  
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: profile,
  });
});

/**
 * Get user by ID
 */
const getUserById = asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfile(req.params.id, req.userId);
  
  res.json({
    success: true,
    message: 'User profile retrieved successfully',
    data: profile,
  });
});

/**
 * Update user profile (including avatar)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, bio, username } = req.body;
  const avatarFile = req.file; // From multer middleware
  
  const updatedProfile = await userService.updateUserProfile(req.userId, {
    fullName,
    bio,
    username,
    avatarFile,
  });
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile,
  });
});

/**
 * Upload/Update profile picture
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided',
    });
  }
  
  const avatarUrl = await userService.uploadAvatar(req.userId, req.file);
  
  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { avatarUrl },
  });
});

/**
 * Delete profile picture
 */
const deleteAvatar = asyncHandler(async (req, res) => {
  await userService.deleteAvatar(req.userId);
  
  res.json({
    success: true,
    message: 'Avatar deleted successfully',
  });
});

/**
 * Follow a user
 */
const followUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await userService.followUser(req.userId, parseInt(id));
  
  res.json({
    success: true,
    message: 'User followed successfully',
  });
});

/**
 * Unfollow a user
 */
const unfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await userService.unfollowUser(req.userId, parseInt(id));
  
  res.json({
    success: true,
    message: 'User unfollowed successfully',
  });
});

/**
 * Get user's followers
 */
const getFollowers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const followers = await userService.getFollowers(parseInt(id));
  
  res.json({
    success: true,
    message: 'Followers retrieved successfully',
    data: followers,
  });
});

/**
 * Get users that a user is following
 */
const getFollowing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const following = await userService.getFollowing(parseInt(id));
  
  res.json({
    success: true,
    message: 'Following retrieved successfully',
    data: following,
  });
});

/**
 * Search users
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const users = await userService.searchUsers(query, req.userId);
  
  res.json({
    success: true,
    message: 'Search results retrieved successfully',
    data: users,
  });
});

module.exports = {
  getAllUsers,
  getProfile,
  getUserById,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
};
