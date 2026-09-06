/**
 * HydraPure OpenAPI 3.0 Specification
 */
export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'HydraPure – Smart Water Purification & IoT Monitoring API',
    version: '1.0.0',
    description: `
**HydraPure** is a production-grade IoT water quality monitoring and fail-safe automated purification system designed for mining-affected and rural communities in Jharkhand, India.

### Core Capabilities:
- **Real-Time Telemetry:** Ingests raw and treated water quality metrics from ESP32 field stations.
- **Fail-Safe Actuation:** Instant automated water supply shutoff (\`BLOCK_SUPPLY\`) if treated water exceeds critical bounds (TDS > 500 ppm, Turbidity > 5.0 NTU, or pH outside 6.5–8.5).
- **Dual Verification:** Multi-stage sensors verify pre-filtration raw water vs post-filtration treated water.
- **Store-and-Forward Sync:** Supports offline packet buffering and batch replay for rural intermittent connectivity.
- **Role-Based Access Control:** Strict RBAC across Super Admins, District Officers, Station Operators, and Field Technicians.
    `,
    contact: {
      name: 'HydraPure Engineering & Operations',
      email: 'tech@hydrapure.gov.in',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
    {
      url: 'https://api.hydrapure.jharkhand.gov.in/api/v1',
      description: 'Production Government Gateway',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Supabase JWT Bearer token obtained from /auth/login',
      },
      DeviceAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Device-Key',
        description: 'Hardware secret key for ESP32 station paired with X-Device-Id',
      },
    },
    schemas: {
      WaterQualityMeasurement: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          station_id: { type: 'string', format: 'uuid' },
          stage: { type: 'string', enum: ['RAW', 'TREATED'] },
          ph: { type: 'number', example: 7.2 },
          tds: { type: 'number', example: 185 },
          turbidity: { type: 'number', example: 1.4 },
          temperature: { type: 'number', example: 24.5 },
          dissolved_oxygen: { type: 'number', example: 6.8 },
          flow_rate: { type: 'number', example: 14.2 },
          recorded_at: { type: 'string', format: 'date-time' },
        },
      },
      Station: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Jharia Mining Colony Filtration Unit' },
          code: { type: 'string', example: 'JH-DNB-001' },
          district: { type: 'string', example: 'Dhanbad' },
          block: { type: 'string', example: 'Jharia' },
          status: { type: 'string', enum: ['SAFE', 'CAUTION', 'BLOCKED', 'OFFLINE', 'MAINTENANCE'] },
          operational_status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'STANDBY'] },
          latitude: { type: 'number', example: 23.7441 },
          longitude: { type: 'number', example: 86.4131 },
          capacity_liters_per_day: { type: 'number', example: 12000 },
        },
      },
      Alert: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          station_id: { type: 'string', format: 'uuid' },
          alert_type: { type: 'string', example: 'TDS_CRITICAL' },
          severity: { type: 'string', enum: ['INFO', 'WARNING', 'CRITICAL'] },
          status: { type: 'string', enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'] },
          metric_name: { type: 'string', example: 'tds' },
          metric_value: { type: 'number', example: 580 },
          threshold_limit: { type: 'number', example: 500 },
          message: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'System Health Check',
        tags: ['System'],
        responses: {
          200: { description: 'API and database are healthy' },
          503: { description: 'Degraded connection' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate User',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@hydrapure.gov.in' },
                  password: { type: 'string', example: 'Admin@123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful with JWT and profile' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/stations': {
      get: {
        summary: 'List Water Purification Stations',
        tags: ['Stations'],
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'List of stations with live state indicators' },
        },
      },
      post: {
        summary: 'Register New Purification Station',
        tags: ['Stations'],
        security: [{ BearerAuth: [] }],
        responses: {
          201: { description: 'Station created' },
        },
      },
    },
    '/stations/{id}/live': {
      get: {
        summary: 'Get Station Live State & Contamination Risk Index',
        tags: ['Stations'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Live telemetry, raw vs treated metrics, risk score (0-100), and valve status' },
        },
      },
    },
    '/stations/{id}/control': {
      post: {
        summary: 'Control Station Valves (Manual Emergency Override)',
        tags: ['Stations'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action', 'reason'],
                properties: {
                  action: { type: 'string', enum: ['BLOCK_SUPPLY', 'RESTORE_SUPPLY', 'OPEN_SAFE_VALVE', 'CLOSE_SAFE_VALVE'] },
                  reason: { type: 'string', example: 'Manual inspection override for membrane cleaning' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Valve state updated and hardware command enqueued' },
        },
      },
    },
    '/iot/telemetry': {
      post: {
        summary: 'Ingest Real-Time Telemetry from ESP32 Hardware',
        tags: ['IoT Hardware'],
        security: [{ DeviceAuth: [] }],
        parameters: [
          { name: 'X-Device-Id', in: 'header', required: true, schema: { type: 'string' } },
          { name: 'X-Device-Key', in: 'header', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['device_id'],
                properties: {
                  device_id: { type: 'string', example: 'ESP32-JHARIA-01' },
                  sequence_number: { type: 'integer', example: 1042 },
                  stage: { type: 'string', default: 'TREATED' },
                  ph: { type: 'number', example: 7.2 },
                  tds: { type: 'number', example: 180 },
                  turbidity: { type: 'number', example: 1.2 },
                  temperature: { type: 'number', example: 25.0 },
                  flow_rate: { type: 'number', example: 15.0 },
                  battery_level: { type: 'number', example: 92 },
                  solar_voltage: { type: 'number', example: 13.8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Telemetry ingested, fail-safe rule evaluated, actuation returned' },
        },
      },
    },
    '/iot/telemetry/batch': {
      post: {
        summary: 'Ingest Batch Buffered Telemetry (Offline Rural Recovery)',
        tags: ['IoT Hardware'],
        security: [{ DeviceAuth: [] }],
        responses: {
          201: { description: 'Batch packets ingested with deduplication' },
        },
      },
    },
    '/alerts': {
      get: {
        summary: 'List Water Quality & Hardware Alerts',
        tags: ['Alerts'],
        responses: {
          200: { description: 'Paginated list of alerts' },
        },
      },
    },
    '/dashboard/summary': {
      get: {
        summary: 'Get Executive Overview Summary & Water Safety Rates',
        tags: ['Dashboard'],
        responses: {
          200: { description: 'Aggregate KPIs, safety percentage, active stations count' },
        },
      },
    },
    '/dashboard/map': {
      get: {
        summary: 'Get Geospatial Coordinates for Dashboard Map',
        tags: ['Dashboard'],
        responses: {
          200: { description: 'Station markers with coordinates and live health status' },
        },
      },
    },
  },
};
