# genericMed 💊

> **Enterprise Multi-Sided Generic Medicine & Bioequivalence Marketplace**  
> An API-first clinical ecosystem connecting Patients, Verified Pharmacies, Pharmaceutical Manufacturers, Ops Specialists, and Health IT Developers with USP <711> $f_2$ bioequivalence calculations, automated escrow settlement, Gemini AI prescription OCR, and HL7 FHIR R4 interoperability.

---

## 🏛️ System Architecture & Directory Structure

The project is architected with a decoupled frontend and backend separation. Each subsystem contains its own independent `package.json`, dependencies, configuration files, and environment settings.

```text
genericMed/
├── frontend/                     # React 19 + Vite 6 + Tailwind CSS v4 UI
│   ├── src/
│   │   ├── components/           # Multi-sided clinical persona portal views
│   │   ├── data/                 # Local UI state & mock references
│   │   ├── services/             # API client (Axios/Fetch) with proxy fallback
│   │   ├── App.tsx               # Root application view & role switcher
│   │   ├── main.tsx              # React DOM entry point
│   │   ├── types.ts              # Frontend domain & UI type declarations
│   │   └── index.css             # Tailwind v4 theme & clinical design system
│   ├── public/                   # Static assets & public resources
│   ├── .env                      # Frontend environment configuration
│   ├── .env.example              # Frontend environment template
│   ├── index.html                # Single Page Application HTML host
│   ├── package.json              # Standalone frontend dependency manifest
│   ├── tsconfig.json             # React 19 JSX/DOM TypeScript config
│   └── vite.config.ts            # Vite build configuration with /api reverse proxy
│
├── backend/                      # Node.js + Express + TypeScript API Engine
│   ├── src/
│   │   ├── config/               # Environment & system configurations
│   │   ├── constants/            # HTTP status codes & system constants
│   │   ├── controllers/          # Request handlers & response formatters
│   │   ├── data/                 # In-memory clinical seed database
│   │   ├── db/                   # PostgreSQL 16 pool, DDL migrations & RLS policies
│   │   ├── middleware/           # RBAC, tenant guard, error handling, rate limiting
│   │   ├── models/               # Domain data access models
│   │   ├── repositories/         # Persistence repository abstractions
│   │   ├── routes/               # Modular REST, FHIR & SSE route endpoints
│   │   ├── services/             # Business logic (math, AI, escrow, cache, Kafka)
│   │   ├── tests/                # Automated verification suites (48 test assertions)
│   │   ├── types/                # Standalone backend domain types (Zero frontend coupling)
│   │   ├── utils/                # Crypto (scrypt), JWT (HMAC-SHA256), responses
│   │   ├── app.ts                # Express application factory & middleware stack
│   │   └── index.ts              # Production server bootstrap & graceful shutdown
│   ├── .env                      # Backend environment configuration
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Standalone backend dependency manifest
│   └── tsconfig.json             # Node.js ES2022 TypeScript configuration
│
├── deploy/                       # Helm 3 production Kubernetes chart
├── k8s/                          # Production Kubernetes manifests (ConfigMap, Secret, Deployment)
├── Dockerfile                    # Multi-stage container build (frontend builder + backend runtime)
├── docker-compose.yml            # Local development orchestration (App + Postgres + Redis + Kafka)
├── package.json                  # Root monorepo orchestration scripts
└── README.md                     # Project documentation & execution guide
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x`+ LTS
- **npm**: `v10.x`+

---

### 2. Dependency Installation

You can install all dependencies from the root directory or within each subsystem individually:

#### Option A: Install All (Root Orchestrator)
```bash
npm run install:all
```

#### Option B: Install Individually
**Frontend dependencies:**
```bash
cd frontend
npm install
cd ..
```

**Backend dependencies:**
```bash
cd backend
npm install
cd ..
```

---

### 3. Environment Configuration

Both the frontend and backend have separate `.env` files:

#### Frontend (`frontend/.env`):
```ini
# Base URL for API calls (Vite automatically proxies /api to backend:5000 in dev)
VITE_API_BASE_URL=/api/v1
```

#### Backend (`backend/.env`):
```ini
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=genericmed-production-super-secret-jwt-key-256bit
DATABASE_URL=postgresql://genericmed_user:secret_pharm_pass@localhost:5432/genericmed_db
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:5000
```

---

### 4. Running the Application

#### Running Both Together (Recommended)
From the project root:
```bash
npm run dev
```
- **Frontend**: Accessible at [http://localhost:3000](http://localhost:3000)
- **Backend API**: Accessible at [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

#### Running Backend Only
From root:
```bash
npm run dev:backend
```
Or inside `backend/`:
```bash
cd backend
npm run dev
```

#### Running Frontend Only
From root:
```bash
npm run dev:frontend
```
Or inside `frontend/`:
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing & Verification

The backend contains 4 comprehensive test suites with **48 automated clinical assertions**:

| Test Suite | File | Focus | Assertions |
| :--- | :--- | :--- | :---: |
| **Phase 1: API Core** | `src/tests/api.test.ts` | USP <711> $f_2$ math, Escrow holds, 4-eye pharmacist sign-off | 12 / 12 |
| **Phase 2: Auth & DB** | `src/tests/phase2_auth_db.test.ts` | `crypto.scrypt`, HMAC-SHA256 JWT, HIPAA audit, PostgreSQL DDL/RLS | 12 / 12 |
| **Phase 3: AI & FHIR** | `src/tests/phase3_ai_fhir.test.ts` | Gemini Vision OCR, INN normalization, HL7 FHIR R4, Live SSE | 12 / 12 |
| **Phase 5: Cloud Hardening** | `src/tests/phase5_cloud_hardening.test.ts` | Redis cache, Rate limiting, Kafka broker/DLQ, Payment webhook | 12 / 12 |

Run all tests from the root:
```bash
npm run test:backend
```
Or inside `backend/`:
```bash
cd backend
npm run test
```

---

## 🏗️ Production Building & Bundling

#### Build Frontend
```bash
npm run build:frontend
```
*Outputs production SPA assets to `frontend/dist/`.*

#### Build Backend
```bash
npm run build:backend
```

---

## 🐳 Docker & Container Deployment

Run the complete production stack (Backend + PostgreSQL 16 + Redis + Kafka) locally with Docker Compose:

```bash
docker-compose up --build
```

Build the multi-stage production container directly:
```bash
docker build -t genericmed:latest .
```

---

## 🏥 Key Clinical Features

- **USP <711> Dissolution Similarity ($f_2$)**: Mathematically verifies that bioequivalent generic profiles meet the FDA 50–100 similarity metric.
- **Role-Based Clinical Personas**:
  - 👤 **Patient**: Formulary search, savings calculator, escrow checkout.
  - 💊 **Pharmacist**: Barcode validation, batch tracking, 4-eye digital release.
  - 🏭 **Manufacturer**: Dissolution dossier uploads, multi-pH curves, RFQ bidding.
  - 🌐 **Operations**: Cold-chain excursion resolution, canonical INN mapping.
  - 💻 **Developer**: HL7 FHIR R4 sandbox, API client explorer, Kafka stream ingestion.
