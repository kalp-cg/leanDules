const express = require('express');
const router = express.Router();
const pushNotificationService = require('../services/push-notification.service');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * @route   POST /api/notifications/register-device
 * @desc    Register device token for push notifications
 * @access  Private
 */
router.post('/register-device', authenticateToken, async (req, res) => {
  try {
    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json(errorResponse('Device token is required'));
    }

    await pushNotificationService.registerDeviceToken(
      req.user.id,
      token,
      platform || 'web'
    );

    res.json(successResponse({}, 'Device registered for push notifications'));
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * @route   DELETE /api/notifications/remove-device
 * @desc    Remove device token
 * @access  Private
 */
router.delete('/remove-device', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(errorResponse('Device token is required'));
    }

    await pushNotificationService.removeDeviceToken(token);
    res.json(successResponse({}, 'Device token removed'));
  } catch (error) {
    console.error('Remove device error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * @route   POST /api/notifications/test
 * @desc    Send test push notification
 * @access  Private
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const result = await pushNotificationService.sendToUser(req.user.id, {
      title: 'Test Notification',
      body: 'This is a test push notification from LearnDuels',
      data: { type: 'test' }
    });

    res.json(successResponse(result, 'Test notification sent'));
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

module.exports = router;
