const request = require('supertest');
const { initializeApp } = require('../src/app');
const { prisma } = require('../src/config/db');

let app;

beforeAll(async () => {
  app = await initializeApp();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Authentication Tests', () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `testuser_${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'Test User'
  };

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 409 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.statusCode).toBe(409);
    });

    it('should return 400 for weak password', async () => {
      const weakUser = {
        username: `weak_${Date.now()}`,
        email: `weak_${Date.now()}@example.com`,
        password: '123',
        fullName: 'Weak User'
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(weakUser);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('JWT Validation', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      token = res.body.data.accessToken;
    });

    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('email', testUser.email);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.statusCode).toBe(401); // Or 403 depending on implementation
    });
  });
});
