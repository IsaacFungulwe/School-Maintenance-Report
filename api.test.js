// api.test.js
require('dotenv').config();
const request = require('supertest');
const app = require('./app'); // Points perfectly to the root app.js now!
const { pool } = require('./src/config/db');

describe('School Maintenance System API Automated Suite', () => {

  // Test 1: Health Endpoint Check
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  // Test 2: Tickets Endpoint Structure Check
  it('GET /api/tickets should execute and respond', async () => {
    const res = await request(app).get('/api/tickets');
    // If it's protected by JWT, it will return 401/403. If it's open, it will return 200.
    // This assertion checks if the route exists and handles the request properly.
    expect([200, 401, 403]).toContain(res.statusCode);
  });

  // Test 3: Location Endpoint Structure Check
  it('GET /api/locations should respond successfully or deny gracefully', async () => {
    const res = await request(app).get('/api/locations');
    expect([200, 401, 403]).toContain(res.statusCode);
  });

  // Test 4: Bad Login Attempt Check
  it('POST /api/auth/login with invalid data should fail authentication', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@school.edu', password: 'wrongpassword123' });
    
    // Most auth systems return 401 Unauthorized for bad credentials
    expect([401, 404]).toContain(res.statusCode); 
  });
  afterAll(async () => {
    if (pool && typeof pool.end === 'function') {
      await pool.end(); // Closes the active Postgres connection channels cleanly
    }
  });

});