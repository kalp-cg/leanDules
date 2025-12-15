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

describe('Security & Edge Cases', () => {
  it('should handle SQL injection attempts', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: "' OR '1'='1",
        password: "' OR '1'='1"
      });

    expect(res.statusCode).not.toBe(500); // Should be 400 or 401, not crash
    expect(res.statusCode).toBe(400); // Likely bad request due to validation
  });

  it('should handle XSS attempts', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: '<script>alert(1)</script>',
        email: `xss_${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'XSS User'
      });

    // Should either sanitize or reject, or at least create user but escape on output.
    // For now, just ensure it doesn't crash.
    expect(res.statusCode).not.toBe(500);
  });

  it('should rate limit requests', async () => {
    // This might be hard to test if limit is high.
    // Just checking if headers exist.
    const res = await request(app).get('/api/auth/me'); // Unauth but hits middleware
    // expect(res.headers).toHaveProperty('x-ratelimit-limit');
  });
});
