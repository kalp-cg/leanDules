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
// Helper functions for State Management (Redis or Memory)
async function getRoom(roomId) {
  const client = getRedisClient();
  if (!client) return activeRooms.get(roomId);

  // Use HGETALL to get all fields
  const data = await client.hgetall(`room:${roomId}`);
  if (!data || Object.keys(data).length === 0) return null;

  // Reconstruct room object
  const room = data.metadata ? JSON.parse(data.metadata) : {};

  // Reconstruct answers
  room.answers = {};
  Object.keys(data).forEach(key => {
    if (key.startsWith('answers:')) {
      const userId = key.split(':')[1];
      try {
        room.answers[userId] = JSON.parse(data[key]);
      } catch (e) { room.answers[userId] = {}; }
    }
  });

  // Reconstruct scores
  room.scores = {};
  Object.keys(data).forEach(key => {
    if (key.startsWith('score:')) {
      const userId = key.split(':')[1];
      room.scores[userId] = parseInt(data[key]) || 0;
    }
  });

  return room;
}

function generateRoomId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function setRoom(roomId, data) {
  const client = getRedisClient();
  if (!client) {
    activeRooms.set(roomId, data);
    return;
  }

  // Split data into hash fields
  const { answers, scores, ...metadata } = data;

  const pipeline = client.pipeline();
  pipeline.hset(`room:${roomId}`, 'metadata', JSON.stringify(metadata));

  // Save answers if present (initial setup)
  if (answers) {
    Object.keys(answers).forEach(uid => {
      pipeline.hset(`room:${roomId}`, `answers:${uid}`, JSON.stringify(answers[uid]));
    });
  }

  // Save scores if present (initial setup)
  if (scores) {
    Object.keys(scores).forEach(uid => {
      pipeline.hset(`room:${roomId}`, `score:${uid}`, scores[uid]);
    });
  }

  // Set expiry (24 hours)
  pipeline.expire(`room:${roomId}`, 86400);

  await pipeline.exec();
}

// Atomic helper for answer submission
async function saveUserAnswer(roomId, userId, answerData) {
  const client = getRedisClient();
  if (!client) {
    const room = activeRooms.get(roomId);
    if (!room) return;
    if (!room.answers[userId]) room.answers[userId] = {};
    Object.assign(room.answers[userId], answerData);
    return;
  }

  // Get current answers for user to merge (serialized per user)
  const currentStr = await client.hget(`room:${roomId}`, `answers:${userId}`);
  const current = currentStr ? JSON.parse(currentStr) : {};

  // Merge new answer
  Object.assign(current, answerData);

  // Save back
  await client.hset(`room:${roomId}`, `answers:${userId}`, JSON.stringify(current));
  // Not strictly atomic R-M-W, but safe per-user
}

// Atomic helper for score update
async function incrementUserScore(roomId, userId, points) {
  const client = getRedisClient();
  if (!client) {
    const room = activeRooms.get(roomId);
    if (room) room.scores[userId] = (room.scores[userId] || 0) + points;
    return (room.scores[userId] || 0);
  }
  return await client.hincrby(`room:${roomId}`, `score:${userId}`, points);
}

async function deleteRoom(roomId) {
  const client = getRedisClient();
  if (!client) return activeRooms.delete(roomId);
  await client.del(`room:${roomId}`);
}

async function getUserRoom(userId) {
  const userIdStr = String(userId); // Ensure consistent type
  const client = getRedisClient();
  if (!client) return userRooms.get(userIdStr);
  const roomId = await client.get(`user_room:${userIdStr}`);
  console.log(`DEBUG: getUserRoom(${userIdStr}) = ${roomId}`);
  return roomId;
}

async function setUserRoom(userId, roomId) {
  const userIdStr = String(userId); // Ensure consistent type
  console.log(`DEBUG: setUserRoom(${userIdStr}, ${roomId})`);
  const client = getRedisClient();
  if (!client) return userRooms.set(userIdStr, roomId);
  await client.set(`user_room:${userIdStr}`, roomId, 'EX', 3600);
}

async function deleteUserRoom(userId) {
  const userIdStr = String(userId); // Ensure consistent type
  const client = getRedisClient();
  if (!client) return userRooms.delete(userIdStr);
  await client.del(`user_room:${userIdStr}`);
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
      room.playerProgress = { [hostId]: 0, [opponentId]: 0 }; // Track individual progress
      room.questions = duel.questions; // Store questions in room

      await setRoom(roomId, room); // Save updated room

      // Notify both players
      io.to(roomId).emit('duel:started', {
        duelId: duel.id,
        roomId: roomId, // CRITICAL: Frontend needs this for socket answer submission
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
          playerProgress: {
            [challengerId]: 0,
            [socket.userId]: 0,
          },
          questions: duel.questions || [], // Store questions in Redis for quick access
        };
        await setRoom(roomId, roomData);
      }

      // 4. Update User Mappings
      await setUserRoom(challengerId, roomId);
      await setUserRoom(socket.userId, roomId);

      console.log(`DEBUG: duel:accept challengeId: ${challengeId}, challengerId: ${challengerId}, roomId: ${roomId}`);

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

      console.log(`DEBUG: Emitting duel:started to room ${roomId} and user ${challengerId}`);
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

  // Submit answer - ASYNC FLOW: Player advances immediately, no waiting for opponent
  socket.on('duel:submit_answer', async (data) => {
    try {
      const { questionId, answer, timeUsed } = data;
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

      // Get current question index for THIS player (individual progress)
      const playerProgress = room.playerProgress || {};
      const currentQuestionIndex = playerProgress[socket.userId] || 0;
      const question = room.questions[currentQuestionIndex];

      if (!question) {
        socket.emit('duel:error', { error: 'No more questions' });
        return;
      }

      // Handle skipped/null answer
      const isSkipped = !answer || answer === '' || answer === null;

      // 1. Persist to Database
      const result = await duelService.submitAnswer(
        room.duelId,
        socket.userId,
        question.id,
        isSkipped ? null : answer,
        timeUsed
      );

      // 2. Update Redis/Memory State
      const answerData = {
        [currentQuestionIndex]: {
          answer: isSkipped ? null : answer,
          timeUsed,
          isCorrect: isSkipped ? false : result.isCorrect,
          isSkipped,
          timestamp: new Date().toISOString(),
        }
      };
      await saveUserAnswer(roomId, socket.userId, answerData);

      // Update score (no points for skipped)
      if (!isSkipped && result.isCorrect) {
        const points = Math.max(1000 - (timeUsed * 10), 100);
        await incrementUserScore(roomId, socket.userId, points);
      }

      // 3. Update this player's progress to next question
      const nextQuestionIndex = currentQuestionIndex + 1;
      playerProgress[socket.userId] = nextQuestionIndex;
      room.playerProgress = playerProgress;
      await setRoom(roomId, room);

      // 4. Get updated scores
      const updatedRoom = await getRoom(roomId);

      // 5. Send immediate result to THIS player only
      socket.emit('duel:answer_result', {
        questionIndex: currentQuestionIndex,
        isCorrect: isSkipped ? false : result.isCorrect,
        isSkipped,
        correctAnswer: question.correctOption,
        currentScore: updatedRoom.scores[socket.userId] || 0,
      });

      // 6. Notify opponent that this player answered (for UI)
      socket.to(roomId).emit('duel:opponent_answered', {
        userId: socket.userId,
        questionIndex: currentQuestionIndex,
        opponentProgress: nextQuestionIndex,
        totalQuestions: room.questions.length,
      });

      // 7. Send next question to THIS player or finish
      if (nextQuestionIndex < room.questions.length) {
        const nextQuestion = room.questions[nextQuestionIndex];
        socket.emit('duel:next_question', {
          questionIndex: nextQuestionIndex,
          question: nextQuestion,
          totalQuestions: room.questions.length,
          timeLimit: 30,
        });
      } else {
        // This player finished!
        socket.emit('duel:player_finished', {
          message: 'You finished! Waiting for opponent...',
          yourScore: updatedRoom.scores[socket.userId] || 0,
          totalQuestions: room.questions.length,
        });
      }

      // 8. Check if BOTH players finished
      const playersToCheck = room.players ?
        (room.players.challenger ? [room.players.challenger, room.players.opponent] : Object.keys(room.players))
        : Object.keys(room.scores);

      const allFinished = playersToCheck.every(id =>
        (updatedRoom.playerProgress?.[id] || 0) >= room.questions.length
      );

      if (allFinished) {
        endDuel(io, roomId);
      }

    } catch (error) {
      console.error('Submit answer error:', error);
      socket.emit('duel:error', {
        error: error.message || 'Failed to submit answer',
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
  socket.on('duel:join_room_ack', async (data) => {
    const roomId = data.roomId;
    socket.join(roomId);
    // CRITICAL: Set user-room mapping for this socket user
    await setUserRoom(socket.userId, roomId);
    console.log(`DEBUG: User ${socket.userId} joined room ${roomId} via ack`);
  });

  // Rematch Request
  socket.on('duel:rematch_request', async (data) => {
    try {
      const roomId = await getUserRoom(socket.userId);
      if (!roomId) {
        socket.emit('duel:error', { message: 'No active room found for rematch' });
        return;
      }

      const room = await getRoom(roomId);
      if (!room) {
        socket.emit('duel:error', { message: 'Room not found' });
        return;
      }

      // Notify other player(s) in the room
      socket.to(roomId).emit('duel:rematch_offered', {
        offeredBy: socket.userId,
        offeredByName: socket.userName || 'Opponent'
      });

      console.log(`Rematch requested by ${socket.userId} in room ${roomId}`);
    } catch (error) {
      console.error('Rematch request error:', error);
      socket.emit('duel:error', { message: 'Failed to request rematch' });
    }
  });

  // Matchmaking Queue
  const matchmakingQueue = []; // Simple in-memory queue for now

  socket.on('duel:join_queue', async (data) => {
    try {
      const { categoryId } = data;

      // Remove if already in queue
      const existingIndex = matchmakingQueue.findIndex(p => p.userId === socket.userId);
      if (existingIndex !== -1) {
        matchmakingQueue.splice(existingIndex, 1);
      }

      // Add to queue
      matchmakingQueue.push({
        userId: socket.userId,
        socketId: socket.id,
        categoryId,
        rating: socket.userRating || 1200,
        timestamp: Date.now()
      });

      socket.emit('duel:queue_joined', { message: 'Joined matchmaking queue' });

      // Check for match
      // Find opponent with same category
      const opponentIndex = matchmakingQueue.findIndex(p =>
        p.userId !== socket.userId &&
        (p.categoryId === categoryId || !categoryId || !p.categoryId) // optional category match
      );

      if (opponentIndex !== -1) {
        const opponent = matchmakingQueue[opponentIndex];
        // Remove both from queue
        // We need to remove current user (last added) and opponent
        matchmakingQueue.splice(matchmakingQueue.indexOf(opponent), 1);
        const currentUserIndex = matchmakingQueue.findIndex(p => p.userId === socket.userId);
        if (currentUserIndex !== -1) matchmakingQueue.splice(currentUserIndex, 1);

        // CREATE DUEL
        const roomId = generateRoomId();

        // Ensure unique room
        // ... (skip unique check for speed, assume random is enough for now or use retry loop)

        // Create duel in DB
        const duel = await duelService.createDuel(socket.userId, opponent.userId, {
          categoryId: categoryId || opponent.categoryId, // Use one of them
          difficultyId: 2, // Default Medium
          questionCount: 5
        });

        await duelService.updateDuelRoomCode(duel.id, roomId);

        // Create Redis Room
        const roomData = {
          id: roomId,
          duelId: duel.id,
          players: {
            challenger: socket.userId,
            opponent: opponent.userId,
          },
          status: 'active',
          createdAt: new Date().toISOString(),
          currentQuestion: 0,
          scores: {
            [socket.userId]: 0,
            [opponent.userId]: 0,
          },
          answers: {
            [socket.userId]: {},
            [opponent.userId]: {},
          },
          playerProgress: {
            [socket.userId]: 0,
            [opponent.userId]: 0,
          },
          questions: duel.questions,
        };
        await setRoom(roomId, roomData);

        // Update User Rooms
        await setUserRoom(socket.userId, roomId);
        await setUserRoom(opponent.userId, roomId);

        // Join Sockets
        socket.join(roomId);
        // Note: Opponent socket might be on another node if clustered, 
        // but for now assume same node or rely on client re-join logic?
        // Actually, we can use io.to(socketId).socketsJoin(roomId) if on same node.
        // Or emit 'duel:match_found' -> client joins room.

        // Better: Emit 'duel:started' to both users directly via user channel
        const startPayload = {
          duelId: duel.id,
          roomId,
          questions: duel.questions,
          players: roomData.players,
          timestamp: new Date().toISOString(),
        };

        io.to(socket.id).emit('duel:started', startPayload);
        io.to(`user:${opponent.userId}`).emit('duel:started', startPayload);

        // Also ensure they join the socket room channel for game events
        socket.join(roomId);
        // We can't force remote socket to join via Redis.
        // We send 'duel:join_room_request' to opponent
        io.to(`user:${opponent.userId}`).emit('duel:join_room_request', { roomId });

        // Start game loop
        setTimeout(() => {
          startDuel(io, roomId);
        }, 3000);

      }
    } catch (error) {
      console.error('Matchmaking error:', error);
      socket.emit('duel:error', { message: 'Failed to join queue' });
    }
  });

  socket.on('duel:leave_queue', () => {
    const index = matchmakingQueue.findIndex(p => p.userId === socket.userId);
    if (index !== -1) {
      matchmakingQueue.splice(index, 1);
      socket.emit('duel:queue_left', { message: 'Left matchmaking queue' });
    }
  });

  // Rematch Accept
  socket.on('duel:rematch_accept', async (data) => {
    try {
      const roomId = await getUserRoom(socket.userId);
      if (!roomId) {
        socket.emit('duel:error', { message: 'No active room found for rematch' });
        return;
      }

      const room = await getRoom(roomId);
      if (!room) {
        socket.emit('duel:error', { message: 'Room not found' });
        return;
      }

      // We need to create a NEW duel with the SAME settings
      // Get settings from the room or the previous duel
      const playerIds = room.players.challenger
        ? [room.players.challenger, room.players.opponent]
        : Object.keys(room.players);

      const hostId = room.players.challenger || playerIds[0];
      const opponentId = room.players.opponent || playerIds[1];

      // Create actual duel in DB
      const newDuel = await duelService.createDuel(hostId, opponentId, room.settings);

      // We can reuse the same roomId but reset the state
      room.status = 'active';
      room.duelId = newDuel.id;
      room.currentQuestion = 0;
      room.scores = { [hostId]: 0, [opponentId]: 0 };
      room.answers = { [hostId]: {}, [opponentId]: {} };
      room.playerProgress = { [hostId]: 0, [opponentId]: 0 };
      room.questions = newDuel.questions;
      room.startedAt = new Date().toISOString();
      room.endedAt = null;

      await setRoom(roomId, room);

      // Notify both players
      io.to(roomId).emit('duel:started', {
        duelId: newDuel.id,
        roomId: roomId, // CRITICAL: Frontend needs this for socket answer submission
        questions: newDuel.questions,
        players: {
          [hostId]: { id: hostId },
          [opponentId]: { id: opponentId }
        },
        isRematch: true
      });

      // Start the game loop
      setTimeout(() => {
        startDuel(io, roomId);
      }, 2000);

    } catch (error) {
      console.error('Rematch accept error:', error);
      socket.emit('duel:error', { message: 'Failed to accept rematch' });
    }
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

  const QUESTION_TIMEOUT = 30000; // 30 seconds

  room.currentQuestion = questionIndex;
  room.questionStartTime = Date.now();
  await setRoom(roomId, room);

  io.to(roomId).emit('duel:question', {
    questionIndex,
    question: room.questions[questionIndex], // Optional: resend question data to be sure
    timeLimit: 30, // seconds
    timestamp: new Date().toISOString(),
  });

  // Auto-advance timeout - if not all players answer in time, force advance
  setTimeout(async () => {
    const currentRoom = await getRoom(roomId);
    if (!currentRoom) return;

    // Check if we're still on the same question
    if (currentRoom.currentQuestion !== questionIndex) return;

    // Get player IDs
    const playersToCheck = currentRoom.players ?
      (currentRoom.players.challenger ? [currentRoom.players.challenger, currentRoom.players.opponent] : Object.keys(currentRoom.players))
      : Object.keys(currentRoom.scores);

    const allAnswered = playersToCheck.every(id =>
      currentRoom.answers[id] && currentRoom.answers[id][questionIndex]
    );

    // If not all answered after timeout, auto-advance
    if (!allAnswered) {
      console.log(`⏰ Question ${questionIndex} timeout in room ${roomId}. Auto-advancing...`);

      // Mark missing answers as skipped
      for (const playerId of playersToCheck) {
        if (!currentRoom.answers[playerId] || !currentRoom.answers[playerId][questionIndex]) {
          await saveUserAnswer(roomId, playerId, {
            [questionIndex]: {
              answer: null,
              timeUsed: 30,
              isCorrect: false,
              isSkipped: true,
              isTimeout: true,
              timestamp: new Date().toISOString(),
            }
          });
        }
      }

      // Fetch updated room and send results
      const updatedRoom = await getRoom(roomId);
      const results = {};
      playersToCheck.forEach(id => {
        results[id] = updatedRoom.answers[id]?.[questionIndex] || { isCorrect: false, isSkipped: true, isTimeout: true };
      });

      io.to(roomId).emit('duel:question_result', {
        questionIndex,
        results,
        currentScores: updatedRoom.scores,
        timedOut: true,
      });

      // Advance to next question or end
      setTimeout(async () => {
        const refreshedRoom = await getRoom(roomId);
        if (!refreshedRoom) return;

        if (questionIndex + 1 < refreshedRoom.questions.length) {
          sendQuestion(io, roomId, questionIndex + 1);
        } else {
          endDuel(io, roomId);
        }
      }, 2000);
    }
  }, QUESTION_TIMEOUT);
}

/**
 * End a duel
 * @param {Object} io - Socket.IO server instance
 * @param {string} roomId - Room ID
 */
async function endDuel(io, roomId) {
  const room = await getRoom(roomId);
  if (!room) return;

  if (room.status === 'completed') return;

  room.status = 'completed';
  room.endedAt = new Date().toISOString();
  await setRoom(roomId, room);

  let playerIds = [];
  if (room.players.challenger) {
    playerIds = [room.players.challenger, room.players.opponent];
  } else {
    playerIds = Object.keys(room.players);
  }

  const p1 = playerIds[0];
  const p2 = playerIds[1];
  const s1 = room.scores[p1] || 0;
  const s2 = room.scores[p2] || 0;

  // Determine winner
  let winnerId = null;
  if (s1 > s2) winnerId = p1;
  else if (s2 > s1) winnerId = p2;

  // Get player names from database
  const { prisma } = require('../config/db');
  let player1Info = { id: p1, name: 'Player 1', avatarUrl: null };
  let player2Info = { id: p2, name: 'Player 2', avatarUrl: null };

  try {
    const [user1, user2] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(p1) }, select: { id: true, fullName: true, avatarUrl: true } }),
      prisma.user.findUnique({ where: { id: parseInt(p2) }, select: { id: true, fullName: true, avatarUrl: true } })
    ]);
    if (user1) player1Info = { id: user1.id, name: user1.fullName || 'Player 1', avatarUrl: user1.avatarUrl };
    if (user2) player2Info = { id: user2.id, name: user2.fullName || 'Player 2', avatarUrl: user2.avatarUrl };
  } catch (e) {
    console.error('Failed to fetch player names:', e);
  }

  // Calculate total time taken per player
  let player1TotalTime = 0;
  let player2TotalTime = 0;
  if (room.answers) {
    Object.values(room.answers[p1] || {}).forEach(a => { player1TotalTime += (a.timeUsed || 0); });
    Object.values(room.answers[p2] || {}).forEach(a => { player2TotalTime += (a.timeUsed || 0); });
  }

  const finalResults = {
    duelId: room.duelId,
    challengeId: room.challengeId,
    roomId,
    winnerId,
    scores: room.scores,
    players: {
      [p1]: { ...player1Info, score: s1, timeTaken: player1TotalTime },
      [p2]: { ...player2Info, score: s2, timeTaken: player2TotalTime }
    },
    totalQuestions: room.questions?.length || 0,
    endedAt: room.endedAt,
  };

  // Send final results
  io.to(roomId).emit('duel:completed', finalResults);

  // Send winner notification
  try {
    const winnerName = winnerId === p1 ? player1Info.name : player2Info.name;
    const loserName = winnerId === p1 ? player2Info.name : player1Info.name;
    const loserId = winnerId === p1 ? p2 : p1;

    if (winnerId) {
      // Notify winner
      io.to(`user:${winnerId}`).emit('notification', {
        type: 'duel_result',
        message: `🏆 You won against ${loserName}! Score: ${room.scores[winnerId]} - ${room.scores[loserId]}`,
        duelId: room.duelId,
      });
      // Notify loser
      io.to(`user:${loserId}`).emit('notification', {
        type: 'duel_result',
        message: `😔 You lost to ${winnerName}. Score: ${room.scores[loserId]} - ${room.scores[winnerId]}`,
        duelId: room.duelId,
      });
    } else {
      // It's a tie
      io.to(`user:${p1}`).emit('notification', {
        type: 'duel_result',
        message: `🤝 It's a tie with ${player2Info.name}! Score: ${s1} - ${s2}`,
        duelId: room.duelId,
      });
      io.to(`user:${p2}`).emit('notification', {
        type: 'duel_result',
        message: `🤝 It's a tie with ${player1Info.name}! Score: ${s2} - ${s1}`,
        duelId: room.duelId,
      });
    }
  } catch (e) {
    console.error('Failed to send winner notification:', e);
  }

  // Clean up
  setTimeout(() => {
    cleanup(roomId);
  }, 10000);
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