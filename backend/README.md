# HydraPure Backend Service

Enterprise IoT telemetry, water quality analytics, and fail-safe automation backend for **HydraPure – Smart Water Purification & Quality Monitoring System** (Jharkhand, India).

---

## 🛠 Tech Stack

- **Runtime:** Node.js (v20+)
- **Framework:** Express.js 4.x (ESM modules)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Real-Time:** WebSockets / Socket.IO
- **Validation:** Zod 3.x
- **Security:** Helmet, CORS, Express Rate Limit, Bcryptjs
- **Logging:** Winston + Morgan
- **Testing:** Vitest + Supertest
- **Scheduling:** Node-Cron

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Default local `.env` values:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=super-secret-jwt-key
```

### 3. Run Database Migrations & Seeds
Execute the SQL files in `supabase/migrations/` using Supabase Studio or CLI:
1. `001_initial_schema.sql` (Creates all tables, types, constraints, and audit log triggers)
2. `002_rls_policies.sql` (Enforces Row Level Security policies)
3. `003_indexes_and_views.sql` (Indexes time-series telemetry and creates materialized views)
4. `supabase/seed/seed.sql` (Seeds 8 representative Jharkhand water purification stations)

Or run the seed script:
```bash
npm run seed
```

### 4. Start Server
Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

- **Interactive Swagger Documentation:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **System Health Check:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🧪 Running Tests

Execute the automated test suite:
```bash
npm test
```

Watch mode during development:
```bash
npm run test:watch
```

---

## 📡 IoT Telemetry Ingestion Example

To simulate an ESP32 water station sending telemetry:

```bash
curl -X POST http://localhost:5000/api/v1/iot/telemetry \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: ESP32-JHARIA-01" \
  -H "X-Device-Key: dev-key-jharia-secret-001" \
  -d '{
    "device_id": "ESP32-JHARIA-01",
    "sequence_number": 105,
    "stage": "TREATED",
    "ph": 7.4,
    "tds": 185,
    "turbidity": 1.2,
    "temperature": 25.0,
    "flow_rate": 15.5,
    "battery_level": 94
  }'
```

### Fail-Safe Response
If treated water exceeds safety thresholds (e.g. `tds: 580`), the response immediately commands:
```json
{
  "success": true,
  "message": "Telemetry ingested and evaluated",
  "data": {
    "actuation_required": true,
    "actuation_command": "BLOCK_SUPPLY",
    "station_status": "BLOCKED",
    "reason": "Critical quality breach: Treated TDS 580 ppm exceeds maximum threshold 500 ppm"
  }
}
```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── app.js                   # Express application configuration & middlewares
│   ├── server.js                # Server entry point, HTTP & Socket.IO listener
│   ├── config/                  # Environment & Supabase configurations
│   ├── controllers/             # Express route controllers
│   ├── docs/                    # OpenAPI / Swagger 3.0 specification
│   ├── jobs/                    # Node-cron background jobs (watchdog, escalation, reports)
│   ├── middleware/              # Auth, device auth, RBAC, error & rate-limit middlewares
│   ├── repositories/            # Data access layer for Supabase tables
│   ├── routes/                  # Modular API routers mounted under /api/v1
│   ├── services/                # Business logic, IoT decision engine, risk scoring
│   ├── sockets/                 # Socket.IO event handlers and rooms
│   ├── utils/                   # Constants, errors, logger, response formatters
│   └── validators/              # Zod validation schemas
├── supabase/
│   ├── migrations/              # SQL schema, RLS policies, indexes
│   └── seed/                    # Demo seed data and runner
└── tests/                       # Vitest integration and unit tests
```
