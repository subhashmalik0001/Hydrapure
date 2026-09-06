import request from 'supertest';
import app from '../src/app.js';
import { riskScoreService } from '../src/services/riskScore.service.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`  ✅ PASSED: ${message}`);
    passed++;
  }
}

async function runTests() {
  console.log('\n========================================================');
  console.log('       HydraPure Backend Comprehensive Test Suite       ');
  console.log('========================================================\n');

  // Test Suite 1: Risk Scoring Engine
  console.log('[Suite 1: Contamination Risk Score Calculation Engine]');
  try {
    const safeResult = riskScoreService.calculateRisk({
      ph: 7.2,
      tds: 180,
      turbidity: 1.2,
    }, 'TREATED');
    assert(safeResult.risk_score <= 25, 'Safe water scores LOW risk (<= 25)');
    assert(safeResult.risk_level === 'SAFE' || safeResult.risk_level === 'LOW', 'Safe water risk level is SAFE');
    assert(safeResult.is_potable === true, 'Safe water is classified as potable');
    assert(typeof safeResult.disclaimer === 'string', 'Assessment includes medical disclaimer');

    const criticalResult = riskScoreService.calculateRisk({
      ph: 4.5,
      tds: 1100,
      turbidity: 12.0,
    }, 'TREATED');
    assert(criticalResult.risk_score >= 70, 'Contaminated water scores CRITICAL risk (>= 70)');
    assert(criticalResult.risk_level === 'CRITICAL', 'Contaminated water risk level is CRITICAL');
    assert(criticalResult.is_potable === false, 'Contaminated water is classified as non-potable');
    assert(criticalResult.reasons.length >= 2, 'Detailed reasons provided for breach');
  } catch (err) {
    // continue
  }

  // Test Suite 2: System Health & Base Routes
  console.log('\n[Suite 2: System Health & Info Endpoints]');
  try {
    const rootRes = await request(app).get('/');
    assert(rootRes.status === 200, 'GET / returns 200 OK');
    assert(rootRes.body.service.includes('HydraPure'), 'Root includes HydraPure service identifier');
    assert(rootRes.body.status === 'OPERATIONAL', 'Root reports OPERATIONAL status');

    const healthRes = await request(app).get('/api/v1/health');
    assert([200, 503].includes(healthRes.status), 'GET /api/v1/health returns valid status code');
    assert(healthRes.body.success === true, 'GET /api/v1/health success is true');
    assert(healthRes.body.data.uptime_seconds >= 0, 'Health check returns positive uptime_seconds');

    const notFoundRes = await request(app).get('/api/v1/non-existent-route');
    assert(notFoundRes.status === 404, 'Unknown endpoint returns 404');
    assert(notFoundRes.body.error.code === 'ROUTE_NOT_FOUND', '404 error code is ROUTE_NOT_FOUND');
  } catch (err) {
    // continue
  }

  // Test Suite 3: Authentication & RBAC
  console.log('\n[Suite 3: Authentication & Session Flows]');
  let adminToken = '';
  try {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@hydrapure.gov.in',
        password: 'Password123!',
      });
    assert(loginRes.status === 200, 'POST /api/v1/auth/login succeeds for default admin');
    assert(!!loginRes.body.data.token, 'Auth response returns session token');
    assert(loginRes.body.data.user.role === 'SUPER_ADMIN', 'Admin user has SUPER_ADMIN role');
    adminToken = loginRes.body.data.token;

    const badLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@hydrapure.gov.in',
        password: 'WrongPassword123',
      });
    assert(badLoginRes.status === 401, 'POST /api/v1/auth/login rejects wrong password with 401');

    const registerEmail = `operator_${Date.now()}@hydrapure.gov.in`;
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: registerEmail,
        password: 'OperatorPass@123',
        full_name: 'Field Technician Soren',
        role: 'VIEWER',
        district: 'Dhanbad',
      });
    assert(registerRes.status === 201, 'POST /api/v1/auth/register creates user account with 201');
    assert(registerRes.body.data.user.email === registerEmail, 'Registered user email matches');

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    assert(meRes.status === 200, 'GET /api/v1/auth/me returns authenticated user profile');
    assert(meRes.body.data.email === 'admin@hydrapure.gov.in', 'Current user profile matches admin email');
  } catch (err) {
    // continue
  }

  // Test Suite 4: Stations & Telemetry State
  console.log('\n[Suite 4: Station Operations & Telemetry State]');
  let testStationId = '';
  try {
    const listRes = await request(app).get('/api/v1/stations');
    assert(listRes.status === 200, 'GET /api/v1/stations returns 200');
    assert(Array.isArray(listRes.body.data) && listRes.body.data.length > 0, 'Returns seeded Jharkhand stations');
    testStationId = listRes.body.data[0].id;

    const filterRes = await request(app).get('/api/v1/stations?district=Dhanbad');
    assert(filterRes.status === 200, 'Filter stations by district returns 200');
    assert(filterRes.body.data.every((s) => s.district.toLowerCase() === 'dhanbad'), 'Filtered stations belong to Dhanbad');

    const liveRes = await request(app).get(`/api/v1/stations/${testStationId}/live`);
    assert(liveRes.status === 200, 'GET /api/v1/stations/:id/live returns station live state');
    assert(liveRes.body.data.risk_score !== undefined, 'Live state includes computed risk_score');
    assert(liveRes.body.data.current_valve_status !== undefined, 'Live state includes current_valve_status');

    // Valve control RBAC
    const unauthControl = await request(app)
      .post(`/api/v1/stations/${testStationId}/control`)
      .send({ action: 'BLOCK_SUPPLY', reason: 'Unauth attempt' });
    assert(unauthControl.status === 401, 'POST /control without token rejected with 401');

    const authControl = await request(app)
      .post(`/api/v1/stations/${testStationId}/control`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'BLOCK_SUPPLY', reason: 'Scheduled membrane descaling maintenance' });
    assert(authControl.status === 200, 'POST /control with admin token executes successfully');
    assert(authControl.body.data.station.status === 'BLOCKED', 'Station status updated to BLOCKED');
  } catch (err) {
    // continue
  }

  // Test Suite 5: IoT Hardware Telemetry & Automated Fail-Safe Shutoff
  console.log('\n[Suite 5: IoT Ingestion & Automated Fail-Safe Shutoff Engine]');
  const deviceId = 'ESP32-JHARIA-01';
  const deviceKey = 'dev-key-jharia-secret-001';

  try {
    const unauthIot = await request(app)
      .post('/api/v1/iot/telemetry')
      .send({ device_id: deviceId, ph: 7.2, tds: 200, turbidity: 1.0 });
    assert(unauthIot.status === 401, 'Telemetry rejected without X-Device-Key header (401)');

    // Ingest safe telemetry
    const safeTelemetryRes = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({
        device_id: deviceId,
        sequence_number: Math.floor(Math.random() * 50000),
        stage: 'TREATED',
        ph: 7.3,
        tds: 185,
        turbidity: 1.1,
        temperature: 25.0,
        flow_rate: 14.5,
        battery_level: 95,
      });
    assert(safeTelemetryRes.status === 201, 'Safe telemetry packet accepted with 201');
    assert(safeTelemetryRes.body.data.actuation_required === false, 'No shutoff required for safe water');
    assert(safeTelemetryRes.body.data.recommended_valve_action === 'ALLOW_SUPPLY', 'Valve action is ALLOW_SUPPLY');

    // Ingest critical breach telemetry (Fail-Safe Automation test)
    const breachTelemetryRes = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({
        device_id: deviceId,
        sequence_number: Math.floor(Math.random() * 50000) + 60000,
        stage: 'TREATED',
        ph: 7.2,
        tds: 580, // > 500 ppm CRITICAL
        turbidity: 1.5,
        temperature: 26.0,
      });
    assert(breachTelemetryRes.status === 201, 'Breach telemetry packet ingested');
    assert(breachTelemetryRes.body.data.actuation_required === true, 'Automated shutoff actuation triggered');
    assert(breachTelemetryRes.body.data.actuation_command === 'BLOCK_SUPPLY', 'Actuation command is BLOCK_SUPPLY');
    assert(breachTelemetryRes.body.data.station_status === 'BLOCKED', 'Station status shifted to BLOCKED');

    // Duplicate packet deduplication test
    const dupSeq = 88888;
    const dupTimestamp = '2026-09-06T15:00:00.000Z';
    await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({ device_id: deviceId, sequence_number: dupSeq, timestamp: dupTimestamp, ph: 7.0, tds: 200, turbidity: 1.0 });

    const dupRes = await request(app)
      .post('/api/v1/iot/telemetry')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({ device_id: deviceId, sequence_number: dupSeq, timestamp: dupTimestamp, ph: 7.0, tds: 200, turbidity: 1.0 });
    assert(dupRes.status === 201, 'Replayed duplicate packet handled with 201');
    assert(dupRes.body.data.duplicate === true, 'Duplicate packet detected and skipped without double-insert');

    // Device Heartbeat
    const hbRes = await request(app)
      .post('/api/v1/iot/heartbeat')
      .set('X-Device-Id', deviceId)
      .set('X-Device-Key', deviceKey)
      .send({
        device_id: deviceId,
        uptime_seconds: 7200,
        battery_percentage: 92,
        signal_strength_dbm: -65,
        firmware_version: 'v1.4.2-prod',
      });
    assert(hbRes.status === 200, 'Heartbeat recorded with 200');
    assert(hbRes.body.data.current_valve_status !== undefined, 'Heartbeat response includes active valve status');
  } catch (err) {
    // continue
  }

  // Summary
  console.log('\n========================================================');
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
