/**
 * Google OAuth Authentication Routes
 * Handles Google OAuth login flow
 */

const express = require('express');
const googleAuthController = require('../controllers/googleAuth.controller');

const router = express.Router();

/**
 * @route   GET /api/auth/google/url
 * @desc    Get Google OAuth authorization URL
 * @access  Public
 * @returns {Object} { success: true, data: { url: string } }
 * 
 * Usage from Flutter:
 * 1. Call this endpoint to get the Google OAuth URL
 * 2. Open the URL in a webview or browser
 * 3. User will be redirected to Google's login page
 */
router.get('/url', googleAuthController.getGoogleAuthUrl);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth callback and exchange code for tokens
 * @access  Public
 * @query   {string} code - Authorization code from Google
 * @returns Redirects to deep link: learn_duel_app://login-success?token=<jwt>&refreshToken=<refreshToken>
 * 
 * This route is called by Google after user authorization.
 * It will:
 * 1. Exchange the authorization code for Google tokens
 * 2. Fetch user profile from Google
 * 3. Create or update user in our database
 * 4. Generate JWT tokens
 * 5. Redirect to Flutter app via deep link with tokens
 */
router.get('/callback', googleAuthController.handleGoogleCallback);

module.exports = router;
