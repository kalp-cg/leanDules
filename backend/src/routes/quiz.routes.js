/**
 * Quiz Routes
 * Routes for quiz management and attempts
 */

const express = require('express');
const { query } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');
const { handleValidationErrors, quizValidation, commonValidation } = require('../utils/validators');
const { asyncHandler } = require('../middlewares/error.middleware');

const router = express.Router();

// Import quiz service
const quizService = require('../services/quiz.service');

// Placeholder controllers
const quizController = {
  createQuiz: asyncHandler(async (req, res) => {
    const quiz = await quizService.createQuiz(req.body, req.userId);
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
  }),

  getQuizById: asyncHandler(async (req, res) => {
    const { includeAnswers } = req.query;
    const quiz = await quizService.getQuizById(
      req.params.id, 
      req.userId, 
      includeAnswers === 'true'
    );
    res.json({
      success: true,
      message: 'Quiz retrieved successfully',
      data: quiz,
    });
  }),

  getQuizzes: asyncHandler(async (req, res) => {
    const { authorId, visibility, page, limit, sortBy, sortOrder } = req.query;
    
    const filters = {
      authorId,
      visibility,
    };
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    };

    const result = await quizService.getQuizzes(filters, options);
    res.json({
      success: true,
      message: 'Quizzes retrieved successfully',
      data: result.quizzes,
      pagination: result.pagination,
    });
  }),

  updateQuiz: asyncHandler(async (req, res) => {
    const quiz = await quizService.updateQuiz(req.params.id, req.body, req.userId);
    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz,
    });
  }),

  deleteQuiz: asyncHandler(async (req, res) => {
    await quizService.deleteQuiz(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  }),

  attemptQuiz: asyncHandler(async (req, res) => {
    const result = await quizService.attemptQuiz(req.params.id, req.body, req.userId);
    res.json({
      success: true,
      message: 'Quiz attempt submitted successfully',
      data: result,
    });
  }),

  getUserAttempts: asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await quizService.getUserAttempts(req.userId, { 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
    res.json({
      success: true,
      message: 'Quiz attempts retrieved successfully',
      data: result.attempts,
      pagination: result.pagination,
    });
  }),
};

// POST /api/quizzes - Create new quiz
router.post(
  '/',
  authenticateToken,
  quizValidation.create,
  handleValidationErrors,
  quizController.createQuiz
);

// GET /api/quizzes - Get quizzes with filters
router.get(
  '/',
  optionalAuth,
  [
    query('authorId')
      .optional()
      .isUUID()
      .withMessage('Author ID must be a valid UUID'),
    query('visibility')
      .optional()
      .isIn(['PUBLIC', 'PRIVATE'])
      .withMessage('Visibility must be PUBLIC or PRIVATE'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'name'])
      .withMessage('Sort by must be createdAt, updatedAt, or name'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    ...commonValidation.pagination,
  ],
  handleValidationErrors,
  quizController.getQuizzes
);

// GET /api/quizzes/my-attempts - Get current user's quiz attempts
router.get(
  '/my-attempts',
  authenticateToken,
  commonValidation.pagination,
  handleValidationErrors,
  quizController.getUserAttempts
);

// GET /api/quizzes/:id - Get quiz by ID
router.get(
  '/:id',
  optionalAuth,
  [
    ...commonValidation.uuid,
    query('includeAnswers')
      .optional()
      .isBoolean()
      .withMessage('Include answers must be a boolean'),
  ],
  handleValidationErrors,
  quizController.getQuizById
);

// PUT /api/quizzes/:id - Update quiz
router.put(
  '/:id',
  authenticateToken,
  [...commonValidation.uuid, ...quizValidation.create],
  handleValidationErrors,
  quizController.updateQuiz
);

// DELETE /api/quizzes/:id - Delete quiz
router.delete(
  '/:id',
  authenticateToken,
  commonValidation.uuid,
  handleValidationErrors,
  quizController.deleteQuiz
);

// POST /api/quizzes/:id/attempt - Attempt a quiz
router.post(
  '/:id/attempt',
  authenticateToken,
  [...commonValidation.uuid, ...quizValidation.attempt],
  handleValidationErrors,
  quizController.attemptQuiz
);

module.exports = router;