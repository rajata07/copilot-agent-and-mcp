const request = require('supertest');
const express = require('express');
const createApiRouter = require('../routes');
const path = require('path');

const app = express();
app.use(express.json());
app.use('/api', createApiRouter({
  usersFile: path.join(__dirname, '../data/test-users.json'),
  booksFile: path.join(__dirname, '../data/test-books.json'),
  readJSON: (file) => require('fs').existsSync(file) ? JSON.parse(require('fs').readFileSync(file, 'utf-8')) : [],
  writeJSON: (file, data) => require('fs').writeFileSync(file, JSON.stringify(data, null, 2)),
  authenticateToken: (req, res, next) => next(),
  SECRET_KEY: 'test_secret',
}));

describe('Auth API', () => {
  const testUser = { username: 'testuser', password: 'testpass' };

  it('POST /api/register should fail with missing fields', async () => {
    const res = await request(app).post('/api/register').send({ username: '' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/register should succeed with valid data', async () => {
    const res = await request(app).post('/api/register').send(testUser);
    // 201 or 409 if already exists
    expect([201, 409]).toContain(res.statusCode);
  });

  it('POST /api/register should fail if user already exists', async () => {
    await request(app).post('/api/register').send(testUser); // ensure exists
    const res = await request(app).post('/api/register').send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/login should succeed with correct credentials', async () => {
    await request(app).post('/api/register').send(testUser); // ensure exists
    const res = await request(app).post('/api/login').send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/login should fail with wrong password', async () => {
    const res = await request(app).post('/api/login').send({ username: testUser.username, password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/login should fail with missing fields', async () => {
    const res = await request(app).post('/api/login').send({ username: '' });
    expect(res.statusCode).toBe(401);
  });

  // generated-by-copilot: Test rate limiting on login endpoint
  it('POST /api/login should enforce rate limiting after 5 attempts', async () => {
    // Create a fresh app instance to avoid rate limit contamination from other tests
    const testApp = express();
    testApp.use(express.json());
    testApp.use('/api', createApiRouter({
      usersFile: path.join(__dirname, '../data/test-users.json'),
      booksFile: path.join(__dirname, '../data/test-books.json'),
      readJSON: (file) => require('fs').existsSync(file) ? JSON.parse(require('fs').readFileSync(file, 'utf-8')) : [],
      writeJSON: (file, data) => require('fs').writeFileSync(file, JSON.stringify(data, null, 2)),
      authenticateToken: (req, res, next) => next(),
      SECRET_KEY: 'test_secret',
    }));

    // Register a test user
    await request(testApp).post('/api/register').send({ username: 'ratelimituser', password: 'testpass' });
    
    // Make 4 login attempts (these should fail authentication but not hit rate limit yet)
    for (let i = 0; i < 4; i++) {
      const res = await request(testApp).post('/api/login').send({ username: 'ratelimituser', password: 'wrong' });
      expect(res.statusCode).toBe(401); // Wrong password, but should not be rate limited yet
    }
    
    // The 5th attempt should still work but is the last one allowed
    const fifthAttempt = await request(testApp).post('/api/login').send({ username: 'ratelimituser', password: 'wrong' });
    expect(fifthAttempt.statusCode).toBe(401);
    
    // The 6th attempt should be rate limited
    const res = await request(testApp).post('/api/login').send({ username: 'ratelimituser', password: 'testpass' });
    expect(res.statusCode).toBe(429); // Too Many Requests
    expect(res.text).toContain('Too many login attempts');
  });
});
