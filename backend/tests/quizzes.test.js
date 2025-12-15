const request = require('supertest');
const { initializeApp } = require('../src/app');
const { prisma } = require('../src/config/db');

let app;
let userToken;
let questionId1, questionId2;
let topicId;
let quizId;

beforeAll(async () => {
  app = await initializeApp();

  // Create User
  const userData = {
    username: 'user_qz_' + Date.now(),
    email: 'user_qz_' + Date.now() + '@example.com',
    password: 'Password123!',
    fullName: 'Quiz User'
  };
  const resUser = await request(app).post('/api/auth/signup').send(userData);
  userToken = resUser.body.data.accessToken;

  // Create Topic
  const topic = await prisma.topic.create({
    data: {
      name: 'Quiz Topic ' + Date.now(),
      slug: 'quiz-topic-' + Date.now(),
      description: 'Test Topic'
    }
  });
  topicId = topic.id;

  // Create Questions
  const q1 = await request(app)
    .post('/api/questions')
    .set('Authorization', 'Bearer ' + userToken)
    .send({
      content: 'Question 1 Content',
      options: [{ id: 'A', text: '1' }, { id: 'B', text: '2' }],
      correctAnswer: 'A',
      difficulty: 'easy',
      type: 'mcq',
      status: 'published',
      topicIds: [topicId]
    });
  
  if (q1.statusCode !== 201) {
    console.error('Create Q1 Error:', JSON.stringify(q1.body, null, 2));
  }
  questionId1 = q1.body.data.id;

  const q2 = await request(app)
    .post('/api/questions')
    .set('Authorization', 'Bearer ' + userToken)
    .send({
      content: 'Question 2 Content',
      options: [{ id: 'A', text: '1' }, { id: 'B', text: '2' }],
      correctAnswer: 'B',
      difficulty: 'easy',
      type: 'mcq',
      status: 'published',
      topicIds: [topicId]
    });
    
  if (q2.statusCode !== 201) {
    console.error('Create Q2 Error:', JSON.stringify(q2.body, null, 2));
  }
  questionId2 = q2.body.data.id;
});

afterAll(async () => {
  // await prisma.();
});

describe('Quizzes & Attempts', () => {
  it('should create quiz with question IDs', async () => {
    const res = await request(app)
      .post('/api/question-sets')
      .set('Authorization', 'Bearer ' + userToken)
      .send({
        name: 'Test Quiz',
        description: 'A test quiz',
        questionIds: [questionId1, questionId2],
        topicId: topicId
      });

    expect(res.statusCode).toBe(201);
    quizId = res.body.data.id;
  });

  it('should fetch quiz questions', async () => {
    const res = await request(app)
      .get('/api/questions/' + questionId1)
      .set('Authorization', 'Bearer ' + userToken);

    expect(res.statusCode).toBe(200);
  });

  it('should submit quiz attempt', async () => {
    const res = await request(app)
      .post('/api/attempts')
      .set('Authorization', 'Bearer ' + userToken)
      .send({
        questionSetId: quizId,
        answers: [
          { questionId: questionId1, selectedOption: 'A', timeSpent: 10 },
          { questionId: questionId2, selectedOption: 'B', timeSpent: 10 }
        ]
      });

    expect(res.statusCode).toBe(201);
  });
});
