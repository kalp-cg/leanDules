/**
 * Environment Configuration
 * Loads and validates environment variables
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const result = dotenv.config({ path: path.join(__dirname, '../../.env') });
console.log('DEBUG: dotenv load result:', result.error ? 'FAILED: ' + result.error.message : 'SUCCESS');

// Environment configuration with defaults
const config = {
  // Server configuration
  NODE_ENV: (process.env.NODE_ENV || 'development').trim(),
  PORT: parseInt(process.env.PORT) || 5000,
  HOST: '0.0.0.0',

  // Database configuration
  DATABASE_URL: (process.env.DATABASE_URL || '').trim(),

  // JWT configuration
  JWT_SECRET: (process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production').trim(),
  JWT_REFRESH_SECRET: (process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production').trim(),
  JWT_EXPIRE: (process.env.JWT_EXPIRE || '15m').trim(),
  JWT_REFRESH_EXPIRE: (process.env.JWT_REFRESH_EXPIRE || '7d').trim(),

  // Redis configuration (optional)
  REDIS_URL: process.env.REDIS_URL,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Rate limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,

  // Google OAuth configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SERVER_URL: 'http://10.159.51.37:4000', // Updated to current local IP
  FLUTTER_DEEP_LINK_SCHEME: process.env.FLUTTER_DEEP_LINK_SCHEME || 'learn_duel_app',

  // Socket.IO configuration
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || '*',

  // Cloudinary configuration (for image uploads)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!config[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Log configuration in development
if (config.NODE_ENV === 'development') {
  console.log('Environment Configuration:');
  console.log(`- Node Environment: ${config.NODE_ENV}`);
  console.log(`- Port: ${config.PORT}`);
  console.log(`- Database URL: ${config.DATABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`- JWT Secret: ${config.JWT_SECRET ? 'Set' : 'Not set'}`);
  console.log(`- CORS Origin: ${config.CORS_ORIGIN}`);
}

module.exports = config;