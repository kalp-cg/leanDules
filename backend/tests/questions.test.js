const request = require('supertest');
const { initializeApp } = require('../src/app');
const { prisma } = require('../src/config/db');

let app;
let adminToken;
let userToken;
let topicId;

beforeAll(async () => {
  app = await initializeApp();

  // Create Admin
  const adminData = {
    username: `admin_q_${Date.now()}`,
    email: `admin_q_${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'Admin User'
  };
  // Assuming we can create admin via signup or seed. 
  // For now, create user and update role manually if needed, or assume signup creates user.
  // But we need admin for some tasks.
  // Let's create a user and update to admin in DB.
  const resAdmin = await request(app).post('/api/auth/signup').send(adminData);
  adminToken = resAdmin.body.data.accessToken;
  const adminId = resAdmin.body.data.user.id;
  await prisma.user.update({ where: { id: adminId }, data: { role: 'admin' } });

  // Create User
  const userData = {
    username: `user_q_${Date.now()}`,
    email: `user_q_${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'Normal User'
  };
  const resUser = await request(app).post('/api/auth/signup').send(userData);
  userToken = resUser.body.data.accessToken;

  // Create Topic
  const topicRes = await request(app)
    .post('/api/topics')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `Topic Q ${Date.now()}`, description: 'Test Topic' });
  topicId = topicRes.body.data.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Topics & Questions', () => {
  let questionId;

  it('should create MCQ question (authenticated)', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: 'What is 2+2?',
        options: [{ id: 'A', text: '3' }, { id: 'B', text: '4' }],
        correctAnswer: 'B',
        difficulty: 'easy',
        type: 'mcq',
        topicId: topicId
      });

    expect(res.statusCode).toBe(201);
    questionId = res.body.data.id;
  });

  it('should fetch question by ID', async () => {
    const res = await request(app)
      .get(`/api/questions/${questionId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(questionId);
  });

  it('should reject unauthenticated question creation', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        content: 'No Auth?',
        options: [],
        correctAnswer: 'A'
      });

    expect(res.statusCode).toBe(401);
  });

  it('should report a question', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'question',
        reportedId: questionId,
        reason: 'Test report'
      });

    expect(res.statusCode).toBe(201);
  });
});
