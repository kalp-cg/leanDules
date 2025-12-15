const express = require('express');
const router = express.Router();
const attemptService = require('../services/attempt.service');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Attempt Routes - Quiz/QuestionSet attempts
 */

// Get user's attempts
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { questionSetId, status, page, limit } = req.query;
    const result = await attemptService.getUserAttempts(req.user.id, {
      questionSetId: questionSetId ? parseInt(questionSetId) : undefined,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Get user's attempt statistics
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const stats = await attemptService.getUserAttemptStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Get attempt by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const attempt = await attemptService.getAttemptById(req.params.id, req.user.id);
    res.json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
});

// Start a new attempt
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { questionSetId } = req.body;
    if (!questionSetId) {
      return res.status(400).json({ success: false, message: 'questionSetId is required' });
    }
    const attempt = await attemptService.startAttempt(req.user.id, questionSetId);
    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
});

// Start a practice attempt
router.post('/practice', authenticate, async (req, res, next) => {
  try {
    const { topicId, difficulty } = req.body;
    if (!topicId) {
      return res.status(400).json({ success: false, message: 'topicId is required' });
    }
    const result = await attemptService.startPracticeAttempt(req.user.id, topicId, difficulty || 'MEDIUM');
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Submit an answer
router.post('/:id/answer', authenticate, async (req, res, next) => {
  try {
    const { questionId, answerIndex, timeTaken } = req.body;
    
    if (!questionId || answerIndex === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'questionId and answerIndex are required' 
      });
    }

    // Map answerIndex to the actual option string if needed, 
    // but attempt.service.js submitAnswer expects 'selectedAnswer'.
    // We need to fetch the question to get the option string from the index?
    // Or does the service handle index?
    // Let's check attempt.service.js submitAnswer again.
    
    // For now, let's assume we need to pass the index or value.
    // The previous service implementation expected 'selectedAnswer' (string).
    // The frontend sends 'answerIndex' (int).
    // We need to bridge this.
    
    // Actually, let's look at attempt.service.js submitAnswer implementation I wrote earlier.
    // It does: const isCorrect = question.correctAnswer === selectedAnswer;
    // So it expects a value.
    // But wait, question.correctAnswer in schema is String.
    // If options are ["A", "B"], correct answer might be "A".
    // If frontend sends index 0, we need to convert to "A" or whatever the value is.
    
    // However, in my seed script (which I can't see but recall), I might have used indices or strings.
    // Let's assume for now we need to pass the value.
    // But we don't have the question here to look up the options.
    // We should update the service to handle answerIndex if possible, or update frontend to send value.
    
    // Let's update the service to handle this lookup.
    // But first, let's just pass what we have to the service and let it handle it.
    // I'll update the service to take answerIndex.
    
    const result = await attemptService.submitAnswer(req.params.id, req.user.id, {
      questionId,
      answerIndex,
      timeTaken: timeTaken || 0,
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Complete an attempt
router.post('/:id/complete', authenticate, async (req, res, next) => {
  try {
    const result = await attemptService.completeAttempt(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get question set leaderboard
router.get('/leaderboard/:questionSetId', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await attemptService.getQuestionSetLeaderboard(
      req.params.questionSetId,
      parseInt(limit)
    );
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
