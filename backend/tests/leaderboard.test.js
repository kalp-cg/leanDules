const request = require('supertest');
const { initializeApp } = require('../src/app');
const { prisma } = require('../src/config/db');

let app;
let userToken;
let topicId;

beforeAll(async () => {
  app = await initializeApp();
  
  // Create User
  const user = await request(app).post('/api/auth/signup').send({
    username: `userL_${Date.now()}`,
    email: `userL_${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'Leaderboard User'
  });
  userToken = user.body.data.accessToken;

  // Create Topic
  const topic = await prisma.topic.create({
    data: {
      name: `Leaderboard Topic ${Date.now()}`,
      slug: `leaderboard-topic-${Date.now()}`,
      description: 'Test Topic'
    }
  });
  topicId = topic.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Leaderboards', () => {
  it('should fetch global leaderboard', async () => {
    const res = await request(app)
      .get('/api/leaderboard/global')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should fetch topic-specific leaderboard', async () => {
    const res = await request(app)
      .get(`/api/leaderboard/global?topicId=${topicId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('should fetch user rank', async () => {
    const res = await request(app)
      .get('/api/leaderboard/my/rank')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('rank');
  });
});
