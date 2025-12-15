const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analytics.service');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json(successResponse(stats, 'Dashboard stats retrieved'));
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * @route   GET /api/analytics/dau
 * @desc    Get Daily Active Users
 * @access  Private (Admin)
 */
router.get('/dau', authenticateToken, async (req, res) => {
  try {
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dau = await analyticsService.getDailyActiveUsers(startDate, endDate);
    res.json(successResponse(dau, 'DAU data retrieved'));
  } catch (error) {
    console.error('Get DAU error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * @route   GET /api/analytics/challenges
 * @desc    Get challenge statistics
 * @access  Private (Admin)
 */
router.get('/challenges', authenticateToken, async (req, res) => {
  try {
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = await analyticsService.getChallengeAcceptanceRate(startDate, endDate);
    res.json(successResponse(stats, 'Challenge stats retrieved'));
  } catch (error) {
    console.error('Get challenge stats error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * @route   GET /api/analytics/quizzes
 * @desc    Get quiz completion statistics
 * @access  Private (Admin)
 */
router.get('/quizzes', authenticateToken, async (req, res) => {
  try {
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = await analyticsService.getQuizCompletionRate(startDate, endDate);
    res.json(successResponse(stats, 'Quiz completion stats retrieved'));
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * @route   GET /api/analytics/engagement
 * @desc    Get user engagement metrics
 * @access  Private (Admin)
 */
router.get('/engagement', authenticateToken, async (req, res) => {
  try {
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = await analyticsService.getUserEngagement(startDate, endDate);
    res.json(successResponse(stats, 'Engagement metrics retrieved'));
  } catch (error) {
    console.error('Get engagement error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * @route   GET /api/analytics/topics/popular
 * @desc    Get popular topics
 * @access  Private
 */
router.get('/topics/popular', authenticateToken, async (req, res) => {
  try {
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const limit = parseInt(req.query.limit) || 10;

    const topics = await analyticsService.getTopicPopularity(startDate, endDate, limit);
    res.json(successResponse(topics, 'Popular topics retrieved'));
  } catch (error) {
    console.error('Get topic popularity error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * @route   GET /api/analytics/retention
 * @desc    Get user retention data
 * @access  Private (Admin)
 */
router.get('/retention', authenticateToken, async (req, res) => {
  try {
    const cohortDate = req.query.cohortDate 
      ? new Date(req.query.cohortDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const retention = await analyticsService.getUserRetention(cohortDate);
    res.json(successResponse(retention, 'Retention data retrieved'));
  } catch (error) {
    console.error('Get retention error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

module.exports = router;
