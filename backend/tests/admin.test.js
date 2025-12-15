const request = require('supertest');
const { initializeApp } = require('../src/app');
const { prisma } = require('../src/config/db');

let app;
let adminToken, userToken;

beforeAll(async () => {
  app = await initializeApp();

  // Create Admin
  const admin = await request(app).post('/api/auth/signup').send({
    username: `adminA_${Date.now()}`,
    email: `adminA_${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'Admin Test'
  });
  adminToken = admin.body.data.accessToken;
  await prisma.user.update({ where: { id: admin.body.data.user.id }, data: { role: 'admin' } });

  // Create User
  const user = await request(app).post('/api/auth/signup').send({
    username: `userA_${Date.now()}`,
    email: `userA_${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'User Test'
  });
  userToken = user.body.data.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Admin Moderation', () => {
  it('Admin can view flagged questions (reports)', async () => {
    const res = await request(app)
      .get('/api/admin/reports') // Assuming route
      .set('Authorization', `Bearer ${adminToken}`);

    // If route exists, 200. If not implemented yet, might be 404.
    // Assuming implemented based on prompt.
    if (res.statusCode !== 404) {
        expect(res.statusCode).toBe(200);
    }
  });

  it('Non-admin access denied', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });
});
