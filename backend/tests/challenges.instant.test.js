const request = require('supertest');
const http = require('http');
const { initializeApp } = require('../src/app');
const { initializeSocket } = require('../src/sockets');
const { prisma } = require('../src/config/db');
const Client = require('socket.io-client');

let app, server, io;
let clientSocketA, clientSocketB;
let userAToken, userBToken;
let userAId, userBId;

beforeAll(async () => {
  app = await initializeApp();
  server = http.createServer(app);
  io = initializeSocket(server);
  
  await new Promise(resolve => server.listen(resolve));
  const port = server.address().port;

  // Create Users
  const userA = await request(app).post('/api/auth/signup').send({
    username: `userAi_${Date.now()}`,
    email: `userAi_${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'User A Instant'
  });
  userAToken = userA.body.data.accessToken;
  userAId = userA.body.data.user.id;

  const userB = await request(app).post('/api/auth/signup').send({
    username: `userBi_${Date.now()}`,
    email: `userBi_${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'User B Instant'
  });
  userBToken = userB.body.data.accessToken;
  userBId = userB.body.data.user.id;

  // Connect Sockets
  clientSocketA = new Client(`http://localhost:${port}`, {
    auth: { token: userAToken }
  });
  
  clientSocketB = new Client(`http://localhost:${port}`, {
    auth: { token: userBToken }
  });

  await Promise.all([
    new Promise(resolve => clientSocketA.on('connect', resolve)),
    new Promise(resolve => clientSocketB.on('connect', resolve))
  ]);
});

afterAll(async () => {
  if (clientSocketA) clientSocketA.close();
  if (clientSocketB) clientSocketB.close();
  if (io) io.close();
  if (server) server.close();
  await prisma.$disconnect();
});

describe('Real-Time Instant Duel', () => {
  it('should handle duel flow', (done) => {
    // 1. Create Challenge via API
    request(app)
      .post('/api/challenges')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        type: 'instant',
        opponentIds: [userBId],
        settings: { numQuestions: 3, difficulty: 'easy' }
      })
      .end((err, res) => {
        if (err) return done(err);
        const challengeId = res.body.data.id;

        // 2. Setup event listeners for game start
        let startCount = 0;
        const onStart = (data) => {
          try {
            expect(data.challengeId).toBe(challengeId);
            expect(data.roomId).toBeDefined();
            startCount++;
            if (startCount === 2) {
              done();
            }
          } catch (e) {
            done(e);
          }
        };

        clientSocketA.on('challenge:started', onStart);
        clientSocketB.on('challenge:started', onStart);

        // 3. User B accepts via Socket (Instant Duel Flow)
        setTimeout(() => {
            clientSocketB.emit('challenge:accept', { challengeId });
        }, 100);
      });
  }, 10000);
});
