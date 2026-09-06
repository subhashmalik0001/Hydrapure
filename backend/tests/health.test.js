import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health & Metadata Endpoints', () => {
  it('GET / should return service metadata', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toContain('HydraPure');
    expect(res.body.status).toBe('OPERATIONAL');
    expect(res.body.documentation).toBe('/api-docs');
  });

  it('GET /api/v1/health should return health check structure', async () => {
    const res = await request(app).get('/api/v1/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('uptime_seconds');
    expect(res.body.data).toHaveProperty('database');
  });

  it('GET /api/v1/unknown should return 404 with standard error format', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
