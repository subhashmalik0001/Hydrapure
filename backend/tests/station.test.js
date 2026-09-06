import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Station Operations API', () => {
  let adminToken = '';
  let sampleStationId = '';

  it('should authenticate as admin to get auth token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@hydrapure.gov.in',
        password: 'Password123!',
      });
    expect(res.status).toBe(200);
    adminToken = res.body.data.token;
  });

  it('GET /api/v1/stations should return list of seeded Jharkhand stations', async () => {
    const res = await request(app).get('/api/v1/stations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    sampleStationId = res.body.data[0].id;
  });

  it('GET /api/v1/stations?district=Dhanbad should filter stations by district', async () => {
    const res = await request(app).get('/api/v1/stations?district=Dhanbad');
    expect(res.status).toBe(200);
    expect(res.body.data.every((s) => s.district.toLowerCase() === 'dhanbad')).toBe(true);
  });

  it('GET /api/v1/stations/:id/live should return live status and risk assessment', async () => {
    const res = await request(app).get(`/api/v1/stations/${sampleStationId}/live`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('risk_score');
    expect(res.body.data).toHaveProperty('current_valve_status');
  });

  it('POST /api/v1/stations/:id/control should require authentication', async () => {
    const res = await request(app)
      .post(`/api/v1/stations/${sampleStationId}/control`)
      .send({
        action: 'BLOCK_SUPPLY',
        reason: 'Unauthorized test attempt',
      });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/stations/:id/control should allow authorized admin to override valve', async () => {
    const res = await request(app)
      .post(`/api/v1/stations/${sampleStationId}/control`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        action: 'BLOCK_SUPPLY',
        reason: 'Maintenance inspection manual override',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.station.status).toBe('BLOCKED');
  });
});
