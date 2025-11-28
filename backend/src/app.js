/**
 * Express Application Setup
 * Main application configuration and middleware setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const { connectDatabase } = require('./config/db');
const { connectRedis } = require('./config/redis');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const duelRoutes = require('./routes/duel.routes');
const categoryRoutes = require('./routes/category.routes');
const questionRoutes = require('./routes/question.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const notificationRoutes = require('./routes/notification.routes');
// const topicRoutes = require('./routes/topic.routes');
// const quizRoutes = require('./routes/quiz.routes');
// const challengeRoutes = require('./routes/challenge.routes');

/**
 * Create Express application
 * @returns {Object} Express app instance
 */
function createApp() {
  const app = express();

  // Trust proxy for rate limiting and IP detection
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Rate limiting - OPTIMIZED for 500-700 users
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes per IP
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter); // Apply to all /api routes

  // Logging
  if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'LearnDuels API is healthy',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // API Info endpoint
  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to LearnDuels API',
      version: '2.0.0',
      documentation: '/api/docs',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        duels: '/api/duels',
        categories: '/api/categories',
        questions: '/api/questions',
        leaderboards: '/api/leaderboards',
        notifications: '/api/notifications',
        // topics: '/api/topics',
        // quizzes: '/api/quizzes',
        // challenges: '/api/challenges',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/duels', duelRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/leaderboards', leaderboardRoutes);
  app.use('/api/notifications', notificationRoutes);
  // app.use('/api/topics', topicRoutes);
  // app.use('/api/quizzes', quizRoutes);
  // app.use('/api/challenges', challengeRoutes);

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Initialize application
 * @returns {Promise<Object>} Express app instance
 */
async function initializeApp() {
  try {
    console.log('🚀 Initializing LearnDuels Backend...');

    // Connect to database
    await connectDatabase();

    // Connect to Redis (optional)
    await connectRedis();

    // Create Express app
    const app = createApp();

    console.log('✅ Application initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
}

module.exports = {
  createApp,
  initializeApp,
};