# RESISYNC: Smart Residential Operations Platform

> A production-oriented web application and gate operations platform for modern residential gated communities, recreating a premium dark dashboard aesthetic with vivid amber-orange accents (#FF8A00), status indicators, and complete operational workflows.

---

## 🏢 Platform Overview & Architecture

RESISYNC provides end-to-end residential management across three distinct personas:
1. **Resident Portal**: Digital expiring QR visitor passes, itemized maintenance billing with automatic breakdown, conflict-prevented amenity reservations, categorized helpdesk ticketing with timeline discussion, society announcements, 24x7 emergency SOS panic dispatch, and smart IoT telemetry monitoring.
2. **Security Guard Gate Console**: Real-time camera QR scanner, 6-digit gate passcode verification, walk-in guest registration, courier package intake with instant resident notification, entry/exit access audit log, and emergency panic dispatch.
3. **Society Management & Administrator**: Financial analytics, monthly maintenance collection trends in INR (₹), flat & unit inventory, resident roster, amenity pricing/maintenance scheduling, staff work order assignment, notice broadcast publisher, and hardware IoT telemetry grid.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, `qrcode.react`, `canvas-confetti`.
- **Backend**: Node.js, Express.js, TypeScript, REST API architecture.
- **Database**: PostgreSQL / SQLite via Prisma ORM (26 normalized models supporting multi-society tenant isolation).
- **Authentication**: JWT token-based authentication with role-based route protection (`RESIDENT`, `SECURITY`, `ADMIN`).
- **Real-Time Communication**: Socket.IO for gate clearances, emergency alarms, and ticket status changes.
- **Validation**: Zod schema validation across all API endpoints and forms.
- **Testing**: Automated backend test suite (14 end-to-end assertions) and frontend Vitest component tests.

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm

### 2. Environment Configuration
Ensure `.env` files are present in both `server/` and `client/` (pre-configured for local dev):
```bash
# Server configuration (server/.env)
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="resisync_super_secret_jwt_key_2026_production"
CLIENT_URL="http://localhost:5173"
MOCK_PAYMENTS=true
MOCK_IOT=true
```

### 3. Database Migration & Seed Data
The database comes pre-seeded with realistic records for **Greenview Residency**:
```bash
cd server
npm run seed
```

### 4. Running the Development Servers
From the root workspace directory, launch both backend and frontend concurrently:
```bash
# Start both client and server:
npm run dev

# Or run separately:
npm run dev:server   # Express API on http://localhost:5000
npm run dev:client   # Vite Frontend on http://localhost:5173
```

---

## 🔑 Demo Login Accounts

All demo accounts share the password: `password123`. The welcome screen and login modal also feature **instant 1-click test login buttons**:

| Role | Email | Password | Persona & Context |
| :--- | :--- | :--- | :--- |
| **Resident** | `resident@resisync.com` | `password123` | Rahul Sharma (Flat A-402, Tower A Aster, 3 BHK) |
| **Security Guard** | `guard@resisync.com` | `password123` | Vikram Singh (Gate 1 Main Barrier Command Post) |
| **Administrator** | `admin@resisync.com` | `password123` | Priya Patel (Society Estate Management Office) |

---

## 📱 Design System & Visual Tokens

The platform follows the dark dashboard design reference:
- **Main Background**: Near-black navy (`#050B10`)
- **Surface Background**: Deep navy-slate (`#10171D`)
- **Elevated Cards**: (`#151E25`) with hover elevation (`#1B252E`)
- **Borders**: Subdued slate-grey (`#2B363F`)
- **Primary Accent**: Vivid amber-orange (`#FF8A00`) with glow highlights
- **Text**: Primary (`#F5F7FA`), Secondary (`#A6B0B9`), Muted (`#6C7A87`)
- **Semantic Statuses**:
  - `Approved` / `Paid` / `Resolved` / `Normal`: Emerald Green (`#10B981`)
  - `Expected` / `Pending` / `In Progress`: Warning Amber (`#F59E0B`)
  - `Emergency` / `Overdue` / `Critical`: Danger Red (`#EF4444`)
  - `Checked In`: Vivid Orange (`#FF8A00`)

---

## 🧪 Testing

### Backend Integration Tests (14 Tests)
Validates auth, visitor pass generation, QR verification, guard check-in, maintenance billing, payment sandbox, amenity conflict prevention, and admin analytics:
```bash
cd server
npm test
```
Result: `14 / 14 tests passed`.

### Frontend Component Tests (Vitest)
```bash
cd client
npm test
```
Result: `3 / 3 test suites passed`.

---

## 📦 Production Build & Deployment

### Build Command
```bash
# Build both server and client:
npm run build
```
- Client compiles to optimized assets in `client/dist`.
- Server compiles TypeScript to `server/dist`.

### Production Deployment to Vercel & Managed Node.js / PostgreSQL
1. **Frontend (Vercel)**:
   - Root directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
2. **Backend (Render / Railway / Fly.io / AWS ECS)**:
   - Root directory: `server`
   - Build Command: `npm run build`
   - Start Command: `node dist/index.js`
   - Database: Connect managed PostgreSQL URL e.g. `postgresql://user:pass@host:5432/resisync?schema=public` in `DATABASE_URL`. Run `npx prisma db push` or `prisma migrate deploy`.

---

## 🔒 External Integrations Ready for Credentials

When switching from Demo Mode to Live Hardware Integrations:
1. **Payment Gateway**: Supply `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env`.
2. **Document / Cloud Storage**: Supply `AWS_S3_BUCKET` credentials for resident deed uploads and complaint photo attachments.
3. **Physical Gate Hardware & MQTT**: Supply `MQTT_BROKER_URL` to connect barrier sensors and RFID scanners directly to Socket.IO.

