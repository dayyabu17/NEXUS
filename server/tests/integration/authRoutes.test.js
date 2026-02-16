const request = require('supertest');
const app = require('../../app');

describe('auth routes', () => {
  test('POST /api/auth/register registers a student', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Reg Student',
      email: 'reg@student.test',
      password: 'Password123!',
      role: 'student',
      phoneNumber: '1234567890',
      regNo: 'REG-4004',
      address: 'Block A',
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Registration successful. Please log in.');
  });

  test('POST /api/auth/login logs in a registered user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Student',
      email: 'login@student.test',
      password: 'Password123!',
      role: 'student',
      phoneNumber: '1234567890',
      regNo: 'REG-5005',
      address: 'Block B',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'login@student.test',
      password: 'Password123!',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.email).toBe('login@student.test');
  });
});
