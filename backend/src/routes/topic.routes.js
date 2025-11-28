/**
 * Topic Routes
 * Routes for educational topic management
 */

const express = require('express');
const { query } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');
const { handleValidationErrors, topicValidation, commonValidation } = require('../utils/validators');
const { asyncHandler } = require('../middlewares/error.middleware');

const router = express.Router();

// Import topic service
const topicService = require('../services/topic.service');

// Placeholder controllers
const topicController = {
  getAllTopics: asyncHandler(async (req, res) => {
    const { parentId, includeChildren } = req.query;
    const topics = await topicService.getAllTopics({ 
      parentId, 
      includeChildren: includeChildren !== 'false' 
    });
    res.json({
      success: true,
      message: 'Topics retrieved successfully',
      data: topics,
    });
  }),

  getTopicById: asyncHandler(async (req, res) => {
    const topic = await topicService.getTopicById(req.params.id);
    res.json({
      success: true,
      message: 'Topic retrieved successfully',
      data: topic,
    });
  }),

  createTopic: asyncHandler(async (req, res) => {
    const topic = await topicService.createTopic(req.body, req.userId);
    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: topic,
    });
  }),

  updateTopic: asyncHandler(async (req, res) => {
    const topic = await topicService.updateTopic(req.params.id, req.body, req.userId);
    res.json({
      success: true,
      message: 'Topic updated successfully',
      data: topic,
    });
  }),

  deleteTopic: asyncHandler(async (req, res) => {
    await topicService.deleteTopic(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Topic deleted successfully',
    });
  }),

  searchTopics: asyncHandler(async (req, res) => {
    const { q, page, limit } = req.query;
    const result = await topicService.searchTopics(q, { page: parseInt(page), limit: parseInt(limit) });
    res.json({
      success: true,
      message: 'Topic search completed successfully',
      data: result.topics,
      pagination: result.pagination,
    });
  }),
};

// GET /api/topics - Get all topics
router.get(
  '/',
  optionalAuth,
  [
    query('parentId')
      .optional()
      .isUUID()
      .withMessage('Parent ID must be a valid UUID'),
    query('includeChildren')
      .optional()
      .isBoolean()
      .withMessage('Include children must be a boolean'),
  ],
  handleValidationErrors,
  topicController.getAllTopics
);

// GET /api/topics/search - Search topics
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
  topicController.searchTopics
);

// GET /api/topics/:id - Get topic by ID
router.get(
  '/:id',
  optionalAuth,
  commonValidation.uuid,
  handleValidationErrors,
  topicController.getTopicById
);

// POST /api/topics - Create new topic (requires authentication)
router.post(
  '/',
  authenticateToken,
  topicValidation.create,
  handleValidationErrors,
  topicController.createTopic
);

// PUT /api/topics/:id - Update topic
router.put(
  '/:id',
  authenticateToken,
  [...commonValidation.uuid, ...topicValidation.create],
  handleValidationErrors,
  topicController.updateTopic
);

// DELETE /api/topics/:id - Delete topic
router.delete(
  '/:id',
  authenticateToken,
  commonValidation.uuid,
  handleValidationErrors,
  topicController.deleteTopic
);

module.exports = router;