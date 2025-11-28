/**
 * Socket.IO Index
 * Main socket initialization and event routing
 */

const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/token');
const config = require('../config/env');

// Import socket handlers
const duelHandler = require('./duel.socket');

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: config.SOCKET_CORS_ORIGIN || config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify the JWT token
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;

      console.log(`Socket authenticated: ${socket.id} (User: ${socket.userId})`);
      next();
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id} (User: ${socket.userId})`);

    // Store user-socket mapping
    userSocketMap.set(socket.userId, socket.id);
    socketUserMap.set(socket.id, socket.userId);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.userId}) - Reason: ${reason}`);
      
      // Clean up mappings
      userSocketMap.delete(socket.userId);
      socketUserMap.delete(socket.id);
      
      // Handle any cleanup needed for duels
      duelHandler.handleDisconnection(socket, io);
    });

    // Register duel event handlers
    duelHandler.registerEvents(socket, io);

    // Handle general events
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });

    // Heartbeat/ping for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`);
    
    // Emit connection success
    socket.emit('connected', {
      message: 'Connected to LearnDuels server',
      socketId: socket.id,
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Error handling
  io.on('error', (error) => {
    console.error('Socket.IO server error:', error);
  });

  console.log('✅ Socket.IO server initialized');
  return io;
}

// In-memory mappings (in production, use Redis)
const userSocketMap = new Map(); // userId -> socketId
const socketUserMap = new Map(); // socketId -> userId

/**
 * Get socket ID for a user
 * @param {string} userId - User ID
 * @returns {string|null} Socket ID or null
 */
function getUserSocketId(userId) {
  return userSocketMap.get(userId) || null;
}

/**
 * Get user ID for a socket
 * @param {string} socketId - Socket ID
 * @returns {string|null} User ID or null
 */
function getSocketUserId(socketId) {
  return socketUserMap.get(socketId) || null;
}

/**
 * Check if user is online
 * @param {string} userId - User ID
 * @returns {boolean} True if user is online
 */
function isUserOnline(userId) {
  return userSocketMap.has(userId);
}

/**
 * Send notification to a specific user
 * @param {Object} io - Socket.IO server instance
 * @param {string} userId - Target user ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 * @returns {boolean} True if notification was sent
 */
function sendToUser(io, userId, event, data) {
  try {
    io.to(`user:${userId}`).emit(event, data);
    return true;
  } catch (error) {
    console.error('Failed to send notification to user:', error);
    return false;
  }
}

/**
 * Broadcast to all connected users
 * @param {Object} io - Socket.IO server instance
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function broadcast(io, event, data) {
  try {
    io.emit(event, data);
  } catch (error) {
    console.error('Failed to broadcast message:', error);
  }
}

module.exports = {
  initializeSocket,
  getUserSocketId,
  getSocketUserId,
  isUserOnline,
  sendToUser,
  broadcast,
};