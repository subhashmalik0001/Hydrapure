# HydraPure – Smart Water Monitoring & Purification Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

An enterprise-grade smart water telemetry, purification monitoring, and automated fail-safe system engineered for continuous monitoring of water treatment plants across Jharkhand, India.

---

## 🏗 Architecture Overview

```
hydra-pure-dashboard/
├── WEB/                     # Frontend Application (Next.js App Router)
│   ├── app/                 # Next.js 15 pages and layouts (App Router)
│   │   ├── alerts/          # Real-time water quality and station alerts
│   │   ├── map/             # Interactive geographic map of monitoring stations
│   │   ├── quality/         # Chemical, physical, and microbial water analytics
│   │   ├── reports/         # Compliance reports and batch export
│   │   ├── settings/        # System configuration and sensor thresholds
│   │   └── stations/        # Station management & deep-dive telemetry
│   ├── components/          # Reusable UI components, KPI cards, charts
│   ├── lib/                 # API client, context providers, static mock data
│   └── public/              # Brand assets, icons, media
│
├── backend/                 # Backend REST & WebSocket Service (Node/Express)
│   ├── src/                 # Application source code
│   │   ├── controllers/     # Route controllers for stations, alerts, telemetry
│   │   ├── middleware/      # Auth, role-based access, error handlers
│   │   ├── routes/          # REST endpoints & API versioning
│   │   ├── services/        # Fail-safe business logic, IoT ingestion, socket manager
│   │   └── config/          # Supabase, logger, and environment configs
│   ├── supabase/            # PostgreSQL migrations, RLS policies, seeds
│   └── tests/               # Automated test suites (Vitest + Supertest)
│
└── .gitignore               # Root repository ignore rules
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v20+
- **pnpm** (recommended for `WEB/`) or **npm**
- **Supabase** account or local Supabase instance

---

### 1. Frontend Setup (`WEB/`)

```bash
cd WEB

# Install dependencies
pnpm install # or npm install

# Configure environment variables
cp .env.example .env.local 2>/dev/null || true

# Start Next.js development server
pnpm dev # runs on http://localhost:3000
```

---

### 2. Backend Setup (`backend/`)

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run database migrations and seed data
npm run seed

# Start Express server with nodemon
npm run dev # runs on http://localhost:5000
```

- **Interactive API Docs (Swagger):** `http://localhost:5000/api-docs`
- **Health Check Endpoint:** `http://localhost:5000/api/v1/health`

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🔒 Security & Best Practices

- **Never commit `.env` files**: All secret keys and database URLs are ignored via `.gitignore`.
- **Large binary files**: Large video assets (`> 100MB`) are excluded from Git to comply with GitHub file constraints.
- **Fail-Safe Mechanism**: The backend enforces automated emergency shut-offs whenever critical thresholds (pH, Turbidity, Heavy Metals) are breached.
