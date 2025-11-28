/**
 * Duel Socket Handler
 * Handles real-time duel functionality
 */

// In-memory duel state (in production, use Redis)
const activeRooms = new Map(); // roomId -> room data
const userRooms = new Map(); // userId -> roomId

/**
 * Register duel event handlers
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.IO server instance
 */
function registerEvents(socket, io) {
  // Send duel invitation
  socket.on('duel:invite', async (data) => {
    try {
      const { challengeId, opponentId, settings } = data;
      
      // Check if opponent is online by checking if they have a socket connection
      const isOpponentOnline = io.sockets.sockets.size > 0 && 
        Array.from(io.sockets.sockets.values()).some(s => s.userId === opponentId);
      
      if (!isOpponentOnline) {
        socket.emit('duel:invitation_failed', {
          error: 'User is not online',
          challengeId,
        });
        return;
      }

      // Send invitation to opponent
      const invitationData = {
        challengeId,
        challengerId: socket.userId,
        challengerEmail: socket.userEmail,
        settings,
        timestamp: new Date().toISOString(),
      };

      // Send to user's room
      const sent = io.to(`user:${opponentId}`).emit('duel:invitation_received', invitationData);
      
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
      const roomId = `duel_${challengeId}`;

      // Create room data
      const roomData = {
        id: roomId,
        challengeId,
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
      };

      // Store room data
      activeRooms.set(roomId, roomData);
      userRooms.set(challengerId, roomId);
      userRooms.set(socket.userId, roomId);

      // Join both users to the room
      socket.join(roomId);
      io.sockets.sockets.forEach((s) => {
        if (s.userId === challengerId) {
          s.join(roomId);
        }
      });

      // Notify both players that duel is accepted
      io.to(roomId).emit('duel:accepted', {
        challengeId,
        roomId,
        players: roomData.players,
        timestamp: new Date().toISOString(),
      });

      // Start the duel after a brief delay
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
      const roomId = userRooms.get(socket.userId);

      if (!roomId) {
        socket.emit('duel:error', { error: 'Not in an active duel' });
        return;
      }

      const room = activeRooms.get(roomId);
      if (!room) {
        socket.emit('duel:error', { error: 'Room not found' });
        return;
      }

      // Store the answer
      room.answers[socket.userId][questionIndex] = {
        answer,
        timeUsed,
        timestamp: new Date().toISOString(),
      };

      // Check if both players have answered
      const playerIds = Object.keys(room.players);
      const allAnswered = playerIds.every(playerId => 
        room.answers[playerId][questionIndex] !== undefined
      );

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
      const roomId = userRooms.get(socket.userId);
      if (roomId) {
        handlePlayerLeave(io, socket, roomId);
      }
    } catch (error) {
      console.error('Duel leave error:', error);
    }
  });
}

/**
 * Start a duel
 * @param {Object} io - Socket.IO server instance
 * @param {string} roomId - Room ID
 */
function startDuel(io, roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return;

  room.status = 'active';
  room.startedAt = new Date().toISOString();

  // Send first question
  sendQuestion(io, roomId, 0);
}

/**
 * Send question to duel participants
 * @param {Object} io - Socket.IO server instance
 * @param {string} roomId - Room ID
 * @param {number} questionIndex - Question index
 */
function sendQuestion(io, roomId, questionIndex) {
  const room = activeRooms.get(roomId);
  if (!room) return;

  room.currentQuestion = questionIndex;

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
function processAnswers(io, roomId, questionIndex) {
  const room = activeRooms.get(roomId);
  if (!room) return;

  // TODO: Implement actual scoring logic based on correct answers and time
  // For now, simulate scoring
  const playerIds = Object.keys(room.players);
  const results = {};

  playerIds.forEach(playerId => {
    const playerAnswer = room.answers[playerId][questionIndex];
    // Simulate scoring (replace with actual logic)
    const isCorrect = Math.random() > 0.5;
    const points = isCorrect ? Math.max(1000 - playerAnswer.timeUsed * 10, 100) : 0;
    
    room.scores[playerId] += points;
    results[playerId] = {
      answer: playerAnswer.answer,
      isCorrect,
      points,
      timeUsed: playerAnswer.timeUsed,
    };
  });

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
function endDuel(io, roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return;

  room.status = 'completed';
  room.endedAt = new Date().toISOString();

  const playerIds = Object.keys(room.players);
  const winner = playerIds.reduce((a, b) => 
    room.scores[a] > room.scores[b] ? a : b
  );

  const finalResults = {
    challengeId: room.challengeId,
    winner,
    scores: room.scores,
    endedAt: room.endedAt,
    duration: new Date(room.endedAt) - new Date(room.startedAt),
  };

  // Send final results
  io.to(roomId).emit('duel:completed', finalResults);

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
function handleDisconnection(socket, io) {
  const roomId = userRooms.get(socket.userId);
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
function handlePlayerLeave(io, socket, roomId) {
  const room = activeRooms.get(roomId);
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
function cleanup(roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return;

  // Remove user room mappings
  Object.values(room.players).forEach(userId => {
    userRooms.delete(userId);
  });

  // Remove room
  activeRooms.delete(roomId);

  console.log(`Duel room ${roomId} cleaned up`);
}

module.exports = {
  registerEvents,
  handleDisconnection,
};