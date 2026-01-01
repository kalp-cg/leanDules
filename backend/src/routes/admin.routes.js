const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * Admin Routes - Moderation and content management
 * All routes require admin role
 */

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Get dashboard statistics
router.get('/dashboard', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Get moderation queue
router.get('/moderation/queue', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await adminService.getModerationQueue({
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Approve question
router.post('/questions/:id/approve', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const question = await adminService.approveQuestion(req.params.id, req.user.id);
    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
});

// Reject question
router.post('/questions/:id/reject', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    const question = await adminService.rejectQuestion(req.params.id, req.user.id, reason);
    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
});

// Get flagged content
router.get('/flags', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await adminService.getFlaggedContent({
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Resolve a flag
router.post('/flags/:id/resolve', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { resolution, action } = req.body;
    if (!resolution || !action) {
      return res.status(400).json({
        success: false,
        message: 'resolution and action are required'
      });
    }
    const flag = await adminService.resolveFlag(
      req.params.id,
      req.user.id,
      resolution,
      action
    );
    res.json({ success: true, data: flag });
  } catch (error) {
    next(error);
  }
});

// Suspend user
router.post('/users/:id/suspend', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { reason, duration } = req.body;
    if (!reason || !duration) {
      return res.status(400).json({
        success: false,
        message: 'reason and duration are required'
      });
    }
    const user = await adminService.suspendUser(
      req.params.id,
      req.user.id,
      reason,
      parseInt(duration)
    );
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Unsuspend user
router.post('/users/:id/unsuspend', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const user = await adminService.unsuspendUser(req.params.id, req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Get admin logs
router.get('/logs', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { adminId, action, page, limit } = req.query;
    const result = await adminService.getAdminLogs({
      adminId: adminId ? parseInt(adminId) : undefined,
      action,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await adminService.getAllUsers({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Flag a question (any authenticated user can flag)
router.post('/questions/:id/flag', authenticate, async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required' });
    }
    const flag = await adminService.flagQuestion(req.params.id, req.user.id, reason);
    res.status(201).json({ success: true, data: flag });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
