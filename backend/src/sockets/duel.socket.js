/**
 * Duel Socket Handler
 * Handles real-time duel functionality with spectator support
 * Updated for Redis Clustering
 */

const spectatorService = require('../services/spectator.service');
const duelService = require('../services/duel.service');
const notificationService = require('../services/notification.service');
const { getRedisClient } = require('../config/redis');

// Fallback in-memory state (used if Redis is not available)
const activeRooms = new Map(); // roomId -> room data
const userRooms = new Map(); // userId -> roomId

// Helper functions for State Management (Redis or Memory)
async function getRoom(roomId) {
  const client = getRedisClient();
  if (!client) return activeRooms.get(roomId);
  const data = await client.get(`room:${roomId}`);
  return data ? JSON.parse(data) : null;
}

function generateRoomId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function setRoom(roomId, data) {
  const client = getRedisClient();
  if (!client) return activeRooms.set(roomId, data);
  // Set with 1 hour expiry to prevent stale data
  await client.set(`room:${roomId}`, JSON.stringify(data), 'EX', 3600);
}

async function deleteRoom(roomId) {
  const client = getRedisClient();
  if (!client) return activeRooms.delete(roomId);
  await client.del(`room:${roomId}`);
}

async function getUserRoom(userId) {
  const client = getRedisClient();
  if (!client) return userRooms.get(userId);
  return await client.get(`user_room:${userId}`);
}

async function setUserRoom(userId, roomId) {
  const client = getRedisClient();
  if (!client) return userRooms.set(userId, roomId);
  await client.set(`user_room:${userId}`, roomId, 'EX', 3600);
}

async function deleteUserRoom(userId) {
  const client = getRedisClient();
  if (!client) return userRooms.delete(userId);
  await client.del(`user_room:${userId}`);
}

/**
 * Register duel event handlers
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.IO server instance
 */
function registerEvents(socket, io) {
  // Create Custom Room
  socket.on('duel:create_room', async (data) => {
    try {
      const { categoryId, difficultyId } = data;
      
      let roomId;
      let attempts = 0;
      do {
        roomId = generateRoomId();
        const existing = await getRoom(roomId);
        if (!existing) break;
        attempts++;
      } while (attempts < 5);

      if (attempts >= 5) {
         throw new Error('Failed to generate unique room ID');
      }

      const roomData = {
        id: roomId,
        hostId: socket.userId,
        players: {
          [socket.userId]: { ready: true }
        },
        settings: { categoryId, difficultyId },
        status: 'waiting',
        createdAt: new Date().toISOString(),
      };

      await setRoom(roomId, roomData);
      await setUserRoom(socket.userId, roomId);
      socket.join(roomId);

      socket.emit('duel:room_created', { roomId });
    } catch (error) {
      console.error('Create room error:', error);
      socket.emit('duel:error', { message: 'Failed to create room' });
    }
  });

  // Join Custom Room
  socket.on('duel:join_room', async (data) => {
    try {
      const { roomId } = data;
      const room = await getRoom(roomId);

      if (!room) {
        socket.emit('duel:error', { message: 'Room not found' });
        return;
      }

      if (room.status !== 'waiting') {
        socket.emit('duel:error', { message: 'Room is not available' });
        return;
      }

      if (Object.keys(room.players).length >= 2) {
        socket.emit('duel:error', { message: 'Room is full' });
        return;
      }

      // Add player
      room.players[socket.userId] = { ready: true };
      await setRoom(roomId, room); // Update room
      await setUserRoom(socket.userId, roomId);
      socket.join(roomId);

      // Start Duel
      const hostId = room.hostId;
      const opponentId = socket.userId;

      // Create actual duel in DB
      const duel = await duelService.createDuel(hostId, opponentId, room.settings);
      
      // Update Duel with Room Code in DB
      await duelService.updateDuelRoomCode(duel.id, roomId);
      
      // Update room with duel data
      room.status = 'active';
      room.duelId = duel.id;
      room.currentQuestion = 0;
      room.scores = { [hostId]: 0, [opponentId]: 0 };
      room.answers = { [hostId]: {}, [opponentId]: {} };
      room.questions = duel.questions; // Store questions in room
      
      await setRoom(roomId, room); // Save updated room

      // Notify both players
      io.to(roomId).emit('duel:started', {
        duelId: duel.id,
        questions: duel.questions,
        players: {
            [hostId]: { id: hostId }, 
            [opponentId]: { id: opponentId }
        }
      });

    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('duel:error', { message: 'Failed to join room' });
    }
  });

  // Send duel invitation
  socket.on('duel:invite', async (data) => {
    try {
      const { challengeId, opponentId, settings } = data;
      
      // Send invitation to opponent
      const invitationData = {
        challengeId,
        challengerId: socket.userId,
        challengerEmail: socket.userEmail,
        settings,
        timestamp: new Date().toISOString(),
      };

      // Create persistent notification
      try {
        await notificationService.createNotification(
          opponentId,
          `${socket.userEmail || 'Someone'} challenged you to a duel!`,
          'duel_invite',
          invitationData
        );
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }

      // Send to user's room (works across cluster with Redis Adapter)
      io.to(`user:${opponentId}`).emit('duel:invitation_received', invitationData);
      
      socket.emit('duel:invitation_sent', {
        challengeId,
        opponentId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Duel invitation error:', error);
      socket.emit('duel:invitation_failed', {
        error: 'Internal server error',
        challengeId: data.challengeId,
      });
    }
  });

  // Accept duel invitation
  socket.on('duel:accept', async (data) => {
    try {
      const { challengeId, challengerId } = data;
      
      // 1. Generate Unique 6-Digit Room ID
      let roomId;
      let attempts = 0;
      do {
        roomId = generateRoomId();
        const existing = await getRoom(roomId);
        if (!existing) break;
        attempts++;
      } while (attempts < 5);

      if (attempts >= 5) {
         socket.emit('duel:error', { error: 'Failed to generate room ID' });
         return;
      }

      // 2. Create/Fetch Duel Record in Database
      // We need to ensure the duel exists in DB before starting
      // The challengeId passed here might be the 'challenge' table ID.
      // We need to check if a 'duel' record already exists for this challenge.
      
      // Note: In our current flow, the frontend calls createDuelChallenge API first,
      // which calls duelService.createDuel, which creates Challenge AND Duel records.
      // So the Duel record SHOULD already exist.
      
      // Let's verify the duel exists and get its details (questions etc)
      // We can use duelService to fetch it or just trust the flow.
      // To be safe and robust, let's fetch the duel to get the questions to store in Redis.
      
      // However, duelService.createDuel returns the duel with questions.
      // If we don't have the questions here, we need to fetch them.
      
      // Let's assume we need to fetch the duel by challengeId
      const duel = await duelService.getDuelByChallengeId(challengeId);
      
      if (!duel) {
         socket.emit('duel:error', { error: 'Duel not found in database' });
         return;
      }

      // Update Duel with Room Code in DB
      await duelService.updateDuelRoomCode(duel.id, roomId);

      // 3. Create Room Data in Redis (if not exists)
      // We use setRoom with NX (not exist) logic implicitly by checking getRoom first
      let roomData = await getRoom(roomId);
      
      if (!roomData) {
        roomData = {
          id: roomId,
          challengeId,
          duelId: duel.id, // Store DB Duel ID
          players: {
            challenger: challengerId,
            opponent: socket.userId,
          },
          status: 'starting',
          createdAt: new Date().toISOString(),
          currentQuestion: 0,
          scores: {
            [challengerId]: 0,
            [socket.userId]: 0,
          },
          answers: {
            [challengerId]: {},
            [socket.userId]: {},
          },
          questions: duel.questions || [], // Store questions in Redis for quick access
        };
        await setRoom(roomId, roomData);
      }

      // 4. Update User Mappings
      await setUserRoom(challengerId, roomId);
      await setUserRoom(socket.userId, roomId);

      // 5. Join Room
      socket.join(roomId);
      
      // Request challenger to join (if on another node)
      io.to(`user:${challengerId}`).emit('duel:join_room_request', { roomId });

      // 6. Notify Players
      // We emit 'duel:started' to match the custom room flow and provide questions
      const startPayload = {
        duelId: duel.id,
        challengeId,
        roomId,
        players: roomData.players,
        questions: duel.questions, // CRITICAL: Send questions to frontend
        timestamp: new Date().toISOString(),
      };

      io.to(roomId).emit('duel:started', startPayload);
      
      // Redundant emit to ensure challenger gets it (if not in room yet)
      io.to(`user:${challengerId}`).emit('duel:started', startPayload);

      // 7. Start Game
      // Only the first person to trigger this should start the timer
      // But setRoom is atomic enough.
      setTimeout(() => {
        startDuel(io, roomId);
      }, 2000);

    } catch (error) {
      console.error('Duel accept error:', error);
      socket.emit('duel:error', {
        error: 'Failed to accept duel',
        challengeId: data.challengeId,
      });
    }
  });

  // Decline duel invitation
  socket.on('duel:decline', async (data) => {
    try {
      const { challengeId, challengerId } = data;

      // Notify challenger that invitation was declined
      io.to(`user:${challengerId}`).emit('duel:declined', {
        challengeId,
        declinedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Duel decline error:', error);
    }
  });

  // Submit answer
  socket.on('duel:submit_answer', async (data) => {
    try {
      const { challengeId, questionIndex, answer, timeUsed } = data;
      const roomId = await getUserRoom(socket.userId);

      if (!roomId) {
        socket.emit('duel:error', { error: 'Not in an active duel' });
        return;
      }

      const room = await getRoom(roomId);
      if (!room) {
        socket.emit('duel:error', { error: 'Room not found' });
        return;
      }

      // Store the answer
      if (!room.answers[socket.userId]) room.answers[socket.userId] = {};
      room.answers[socket.userId][questionIndex] = {
        answer,
        timeUsed,
        timestamp: new Date().toISOString(),
      };
      
      await setRoom(roomId, room); // Save answer

      // Check if both players have answered
      const playerIds = Object.keys(room.players);
      // Note: room.players structure differs between custom room and invite room
      // Custom: { userId: { ready: true } }
      // Invite: { challenger: id, opponent: id }
      
      let allAnswered = false;
      if (room.players.challenger) {
         // Invite room structure
         const p1 = room.players.challenger;
         const p2 = room.players.opponent;
         allAnswered = room.answers[p1]?.[questionIndex] && room.answers[p2]?.[questionIndex];
      } else {
         // Custom room structure
         allAnswered = playerIds.every(playerId => 
            room.answers[playerId] && room.answers[playerId][questionIndex] !== undefined
         );
      }

      if (allAnswered) {
        // Process answers and update scores
        processAnswers(io, roomId, questionIndex);
      } else {
        // Notify room that one player has answered
        socket.to(roomId).emit('duel:opponent_answered', {
          questionIndex,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('Submit answer error:', error);
      socket.emit('duel:error', {
        error: 'Failed to submit answer',
      });
    }
  });

  // Leave duel
  socket.on('duel:leave', async (data) => {
    try {
      const roomId = await getUserRoom(socket.userId);
      if (roomId) {
        handlePlayerLeave(io, socket, roomId);
      }
    } catch (error) {
      console.error('Duel leave error:', error);
    }
  });
  
  // Handle join room request (for clustering support)
  socket.on('duel:join_room_ack', (data) => {
      socket.join(data.roomId);
  });
}

/**
 * Start a duel
 * @param {Object} io - Socket.IO server instance
 * @param {string} roomId - Room ID
 */
async function startDuel(io, roomId) {
  const room = await getRoom(roomId);
  if (!room) return;

  room.status = 'active';
  room.startedAt = new Date().toISOString();
  await setRoom(roomId, room);

  // Send first question
  sendQuestion(io, roomId, 0);
}

/**
 * Send question to duel participants
 * @param {Object} io - Socket.IO server instance
 * @param {string} roomId - Room ID
 * @param {number} questionIndex - Question index
 */
async function sendQuestion(io, roomId, questionIndex) {
  const room = await getRoom(roomId);
  if (!room) return;

  room.currentQuestion = questionIndex;
  await setRoom(roomId, room);

  io.to(roomId).emit('duel:question', {
    questionIndex,
    timeLimit: 30, // seconds
    timestamp: new Date().toISOString(),
  });
}

/**
 * Process answers for a question
 * @param {Object} io - Socket.IO server instance
 * @param {string} roomId - Room ID
 * @param {number} questionIndex - Question index
 */
async function processAnswers(io, roomId, questionIndex) {
  const room = await getRoom(roomId);
  if (!room) return;

  // Determine player IDs based on room structure
  let playerIds = [];
  if (room.players.challenger) {
      playerIds = [room.players.challenger, room.players.opponent];
  } else {
      playerIds = Object.keys(room.players);
  }

  const results = {};

  playerIds.forEach(playerId => {
    const playerAnswer = room.answers[playerId][questionIndex];
    // Simulate scoring (replace with actual logic)
    // In a real app, we'd check against the correct answer from DB or room.questions
    const isCorrect = Math.random() > 0.5; // Placeholder logic
    const points = isCorrect ? Math.max(1000 - playerAnswer.timeUsed * 10, 100) : 0;
    
    if (!room.scores[playerId]) room.scores[playerId] = 0;
    room.scores[playerId] += points;
    
    results[playerId] = {
      answer: playerAnswer.answer,
      isCorrect,
      points,
      timeUsed: playerAnswer.timeUsed,
    };
  });
  
  await setRoom(roomId, room);

  // Send results to room
  io.to(roomId).emit('duel:question_result', {
    questionIndex,
    results,
    currentScores: room.scores,
    timestamp: new Date().toISOString(),
  });

  // Move to next question or end duel
  setTimeout(() => {
    const totalQuestions = 10; // TODO: Get from challenge settings
    if (questionIndex + 1 < totalQuestions) {
      sendQuestion(io, roomId, questionIndex + 1);
    } else {
      endDuel(io, roomId);
    }
  }, 3000); // 3 second delay before next question
}

/**
 * End a duel
 * @param {Object} io - Socket.IO server instance
 * @param {string} roomId - Room ID
 */
async function endDuel(io, roomId) {
  const room = await getRoom(roomId);
  if (!room) return;

  room.status = 'completed';
  room.endedAt = new Date().toISOString();
  await setRoom(roomId, room);

  let playerIds = [];
  if (room.players.challenger) {
      playerIds = [room.players.challenger, room.players.opponent];
  } else {
      playerIds = Object.keys(room.players);
  }

  const winner = playerIds.reduce((a, b) => 
    (room.scores[a] || 0) > (room.scores[b] || 0) ? a : b
  );

  const finalResults = {
    challengeId: room.challengeId,
    winner,
    scores: room.scores,
    endedAt: room.endedAt,
    duration: new Date(room.endedAt) - new Date(room.startedAt),
  };

  // Send final results to players and spectators
  io.to(roomId).emit('duel:completed', finalResults);

  // End spectating
  if (room.challengeId) {
      spectatorService.endDuelSpectating(room.challengeId);
  }

  // Clean up
  setTimeout(() => {
    cleanup(roomId);
  }, 30000); // Clean up after 30 seconds
}

/**
 * Handle player disconnection
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.IO server instance
 */
async function handleDisconnection(socket, io) {
  const roomId = await getUserRoom(socket.userId);
  if (roomId) {
    handlePlayerLeave(io, socket, roomId);
  }
}

/**
 * Handle player leaving duel
 * @param {Object} io - Socket.IO server instance
 * @param {Object} socket - Socket instance
 * @param {string} roomId - Room ID
 */
async function handlePlayerLeave(io, socket, roomId) {
  const room = await getRoom(roomId);
  if (!room) return;

  // Notify other players
  socket.to(roomId).emit('duel:player_left', {
    userId: socket.userId,
    timestamp: new Date().toISOString(),
  });

  // If duel is active, end it
  if (room.status === 'active') {
    endDuel(io, roomId);
  } else {
    // Clean up immediately if duel hasn't started
    cleanup(roomId);
  }
}

/**
 * Clean up room and user mappings
 * @param {string} roomId - Room ID
 */
async function cleanup(roomId) {
  const room = await getRoom(roomId);
  if (!room) return;

  // Remove user room mappings
  let playerIds = [];
  if (room.players.challenger) {
      playerIds = [room.players.challenger, room.players.opponent];
  } else {
      playerIds = Object.keys(room.players);
  }

  for (const userId of playerIds) {
      await deleteUserRoom(userId);
  }

  // Remove room
  await deleteRoom(roomId);

  console.log(`Duel room ${roomId} cleaned up`);
}

module.exports = {
  registerEvents,
  handleDisconnection,
};