/**
 * Challenge Routes
 * Routes for challenge and duel management
 */

const express = require('express');
const { query } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { handleValidationErrors, challengeValidation, commonValidation } = require('../utils/validators');
const { asyncHandler } = require('../middlewares/error.middleware');

const router = express.Router();

// Import challenge service
const challengeService = require('../services/challenge.service');

// Placeholder controllers
const challengeController = {
  createChallenge: asyncHandler(async (req, res) => {
    const challenge = await challengeService.createChallenge(req.body, req.userId);
    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: challenge,
    });
  }),

  getChallengeById: asyncHandler(async (req, res) => {
    const challenge = await challengeService.getChallengeById(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Challenge retrieved successfully',
      data: challenge,
    });
  }),

  getUserChallenges: asyncHandler(async (req, res) => {
    const { status, type, page, limit } = req.query;
    
    const filters = { status, type };
    const options = { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 20 
    };

    const result = await challengeService.getUserChallenges(req.userId, filters, options);
    res.json({
      success: true,
      message: 'Challenges retrieved successfully',
      data: result.challenges,
      pagination: result.pagination,
    });
  }),

  acceptChallenge: asyncHandler(async (req, res) => {
    const challenge = await challengeService.acceptChallenge(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Challenge accepted successfully',
      data: challenge,
    });
  }),

  submitAttempt: asyncHandler(async (req, res) => {
    const result = await challengeService.submitChallengeAttempt(
      req.params.id, 
      req.body, 
      req.userId
    );
    res.json({
      success: true,
      message: 'Challenge attempt submitted successfully',
      data: result,
    });
  }),

  getChallengeResult: asyncHandler(async (req, res) => {
    const challenge = await challengeService.getChallengeById(req.params.id, req.userId);
    
    if (challenge.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Challenge is not yet completed',
      });
    }

    res.json({
      success: true,
      message: 'Challenge result retrieved successfully',
      data: {
        challengeId: challenge.id,
        status: challenge.status,
        results: challenge.results,
        participants: {
          challenger: challenge.challenger,
          opponent: challenge.opponent,
        },
      },
    });
  }),

  cancelChallenge: asyncHandler(async (req, res) => {
    await challengeService.cancelChallenge(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Challenge cancelled successfully',
    });
  }),
};

// POST /api/challenges - Create new challenge
router.post(
  '/',
  authenticateToken,
  challengeValidation.create,
  handleValidationErrors,
  challengeController.createChallenge
);

// GET /api/challenges - Get current user's challenges
router.get(
  '/',
  authenticateToken,
  [
    query('status')
      .optional()
      .isIn(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
      .withMessage('Status must be PENDING, ACTIVE, COMPLETED, or CANCELLED'),
    query('type')
      .optional()
      .isIn(['ASYNC', 'INSTANT'])
      .withMessage('Type must be ASYNC or INSTANT'),
    ...commonValidation.pagination,
  ],
  handleValidationErrors,
  challengeController.getUserChallenges
);

// GET /api/challenges/:id - Get challenge by ID
router.get(
  '/:id',
  authenticateToken,
  commonValidation.uuid,
  handleValidationErrors,
  challengeController.getChallengeById
);

// POST /api/challenges/:id/accept - Accept a challenge
router.post(
  '/:id/accept',
  authenticateToken,
  challengeValidation.accept,
  handleValidationErrors,
  challengeController.acceptChallenge
);

// POST /api/challenges/:id/attempt - Submit challenge attempt
router.post(
  '/:id/attempt',
  authenticateToken,
  [
    ...commonValidation.uuid,
    ...challengeValidation.create, // Reuse validation for attempt data
  ],
  handleValidationErrors,
  challengeController.submitAttempt
);

// GET /api/challenges/:id/result - Get challenge result
router.get(
  '/:id/result',
  authenticateToken,
  commonValidation.uuid,
  handleValidationErrors,
  challengeController.getChallengeResult
);

// DELETE /api/challenges/:id - Cancel challenge
router.delete(
  '/:id',
  authenticateToken,
  commonValidation.uuid,
  handleValidationErrors,
  challengeController.cancelChallenge
);

module.exports = router;