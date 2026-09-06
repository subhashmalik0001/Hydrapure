import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication API Flow', () => {
  it('should authenticate default admin and return JWT session', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@hydrapure.gov.in',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.role).toBe('SUPER_ADMIN');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@hydrapure.gov.in',
        password: 'IncorrectPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'not-an-email',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should register a new viewer user successfully', async () => {
    const testEmail = `operator_${Date.now()}@hydrapure.gov.in`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'OperatorPass@123',
        full_name: 'Field Officer Verma',
        role: 'VIEWER',
        district: 'Dhanbad',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
  });
});
