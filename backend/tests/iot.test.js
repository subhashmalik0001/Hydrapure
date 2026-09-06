import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('IoT Ingestion & Fail-Safe Automation Engine', () => {
  const deviceId = 'ESP32-JHARIA-01';
  const deviceKey = 'dev-key-jharia-secret-001';

  it('POST /api/v1/iot/telemetry should reject unauthenticated hardware requests', async () => {
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .send({
        device_id: deviceId,
        ph: 7.2,
        tds: 200,
        turbidity: 1.0,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/iot/telemetry should accept valid telemetry and ALLOW_SUPPLY when water is safe', async () => {
    const seq = Math.floor(Math.random() * 100000);
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({
        device_id: deviceId,
        sequence_number: seq,
        stage: 'TREATED',
        ph: 7.4,
        tds: 180,
        turbidity: 1.1,
        temperature: 24.5,
        flow_rate: 15.0,
        battery_level: 95,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.actuation_required).toBe(false);
    expect(res.body.data.recommended_valve_action).toBe('ALLOW_SUPPLY');
  });

  it('POST /api/v1/iot/telemetry should automatically trigger BLOCK_SUPPLY when treated TDS exceeds 500 ppm', async () => {
    const seq = Math.floor(Math.random() * 100000) + 10000;
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({
        device_id: deviceId,
        sequence_number: seq,
        stage: 'TREATED',
        ph: 7.2,
        tds: 580, // CRITICAL BREACH
        turbidity: 1.5,
        temperature: 26.0,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.actuation_required).toBe(true);
    expect(res.body.data.actuation_command).toBe('BLOCK_SUPPLY');
    expect(res.body.data.station_status).toBe('BLOCKED');
  });

  it('POST /api/v1/iot/telemetry should reject duplicate packets gracefully', async () => {
    const duplicateSeq = 999999;
    const fixedTimestamp = '2026-09-06T12:00:00.000Z';

    // First ingestion
    await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({
        device_id: deviceId,
        sequence_number: duplicateSeq,
        timestamp: fixedTimestamp,
        ph: 7.2,
        tds: 210,
        turbidity: 1.2,
      });

    // Duplicate replay attempt
    const res = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({
        device_id: deviceId,
        sequence_number: duplicateSeq,
        timestamp: fixedTimestamp,
        ph: 7.2,
        tds: 210,
        turbidity: 1.2,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.duplicate).toBe(true);
  });

  it('POST /api/v1/iot/heartbeat should record device ping and return active valve status', async () => {
    const res = await request(app)
      .post('/api/v1/iot/heartbeat')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({
        device_id: deviceId,
        uptime_seconds: 3600,
        battery_percentage: 90,
        signal_strength_dbm: -68,
        firmware_version: 'v1.4.2-prod',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('current_valve_status');
  });
});
