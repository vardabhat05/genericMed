# Changelog

All notable changes to the **genericMed** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.0] - 2026-09-09

### Added
- **Production Multi-Stage Dockerfile (`Dockerfile`, `.dockerignore`):**
  - 3-stage build (Builder, Deps Pruning, Minimal Runner) using Node.js 20 Alpine.
  - POSIX signal handling via `dumb-init` and unprivileged execution (`USER node`).
  - Container health check targeting `/health/live`.
- **Multi-Container Local Orchestration (`docker-compose.yml`):**
  - Orchestrates `genericmed-api`, PostgreSQL 16 (with automated schema and seed mounting), and Redis 7.2 with health dependencies.
- **Kubernetes Production Infrastructure (`k8s/`):**
  - Enterprise manifests: `namespace.yaml`, `configmap.yaml`, `secret.yaml`, `deployment.yaml` (with rolling update and probes), `service.yaml` (with ClientIP affinity), `ingress.yaml` (with TLS certificate automation), and `hpa.yaml` (2-10 replicas).
- **Helm 3 Chart Package (`deploy/helm/genericmed/`):**
  - Parameterized Helm 3 package with configurable resources, probes, autoscaling, ingress, and secrets.
- **Distributed Redis Caching Tier (`server/services/cache.service.ts`):**
  - Redis connection manager with key namespacing, TTL automatic key eviction, and resilient in-memory LRU fallback.
- **Sliding-Window Rate Limiter Middleware (`server/middleware/rateLimiter.ts`):**
  - Enforces RFC standard headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After`) with elevated quotas for API partners.
- **Enterprise Event Broker & Dead Letter Queue (`server/services/kafka.service.ts`):**
  - Topic emission across orders, cold-chain telemetry, substitution, and audit streams with automatic DLQ routing (`dlq.*`) for failed consumer messages.
- **Universal Payment Gateway Adapter (`server/services/payment.service.ts`):**
  - `PaymentGatewayProvider` interface supporting Escrow Vault, Stripe PaymentIntent, and Dwolla ACH payouts with webhook signature verification.
- **Prometheus Observability & Probes (`server/services/metrics.service.ts`):**
  - Prometheus OpenMetrics exposition endpoint (`/metrics`) tracking request count, error count, P50/P90/P99 latency histograms, active SSE gauges, and cold-chain excursions.
  - Distinct `/health/live` (process liveness) and `/health/ready` (database & cache readiness) probes.
- **Automated Verification:**
  - Automated test runner `server/tests/phase5_cloud_hardening.test.ts` passing 12/12 assertions.
  - Added `"test:phase5"` script in `package.json`.

---

## [1.4.0] - 2026-09-09

### Added
- **Unified Frontend-to-Backend API Client Bridge (`src/services/apiClient.ts`):**
  - Centralized typed fetch client connecting to `/api/v1/*` via Vite's `/api` proxy.
  - Automatic Bearer JWT authentication header injection from `localStorage`.
  - Zero-downtime resilience: Transparent fallback to mock data if the backend server is temporarily unreachable.
  - Reactive connection status monitoring with real-time heartbeat and listener subscriptions.
- **Cross-Persona Header & JWT Sync (`src/components/common/Header.tsx`):**
  - Live connection status badge: `● LIVE BACKEND (PORT 5000)` vs `○ RESILIENT LOCAL FALLBACK`.
  - Automatic persona authentication and tenant token acquisition on tab switch.
  - Active persona initials avatar and role metadata display.
- **Patient App Live Wiring (`src/components/customer/CustomerAppView.tsx`):**
  - Live prescription image OCR extraction via `apiClient.prescriptions.extractOcr`.
  - Live escrow pre-authorization and order creation via `apiClient.orders.checkout`.
  - Live order number and courier PIN display in payment success card.
- **Dispensary Store Node #4 Live Wiring (`src/components/pharmacy/PharmacyNodeView.tsx`):**
  - Active orders queue loaded from `apiClient.orders.getAll()`.
  - Dispensary stock ledger loaded from `apiClient.pharmacy.getInventory()`.
  - Interactive barcode replenishment calls `apiClient.pharmacy.scanBarcode()`.
  - Item verification calls `apiClient.orders.verifyItem()`.
  - 4-eye pharmacist digital sign-off calls `apiClient.orders.pharmacistSignoff()`.
  - Courier handover calls `apiClient.orders.courierHandover()`.
  - Live Server-Sent Events (SSE) telemetry stream (`/api/v1/telemetry/stream`) dynamically updating temperature readings.
- **Manufacturer Hub Live Wiring (`src/components/manufacturer/ManufacturerHubView.tsx`):**
  - Loaded dossiers and RFQs from backend endpoints.
  - Competitive volume RFQ bidding submits live bids via `apiClient.manufacturers.placeBid()`.
- **Operations Center Live Wiring (`src/components/operations/OpsControlView.tsx`):**
  - Exception resolution calls `apiClient.operations.resolveException()`.
  - Canonical salt mapping decisions call `apiClient.operations.updateMappingDecision()`.
  - New canonical salts published via `apiClient.operations.addCanonicalSalt()`.
- **Developer API Gateway Live Wiring (`src/components/developer/ApiGatewayView.tsx`):**
  - Interactive API Explorer sends requests to `apiClient.gateway.runExplorerTest()`, measuring real backend execution latency.
  - Kafka event simulation dispatches live webhook events via `apiClient.gateway.emitEvent()`.
- **Phase Roadmap Documentation (`phases.md`):**
  - Comprehensive milestone tracking document authored across all 5 engineering phases.

---

## [1.3.5] - 2026-09-09

### Added
- **Server-Side Gemini Vision AI OCR (`server/services/ai.service.ts`):**
  - Integrated `@google/genai` with strict JSON clinical extraction schemas and fallback heuristics.
- **HL7 FHIR R4 Interoperability (`server/services/fhir.service.ts`):**
  - Standardized FHIR R4 `MedicationRequest`, `MedicationDispense`, and `Bundle` endpoints.
- **Real-Time Cold-Chain Telemetry (`server/services/telemetry.service.ts`):**
  - Server-Sent Events broadcaster streaming live IoT sensor readings (`/api/v1/telemetry/stream`).
- **Phase 3 Test Suite:**
  - Automated test suite `server/tests/phase3_ai_fhir.test.ts` passing 12/12 test assertions.

---

## [1.3.0] - 2026-09-09

### Added
- **Multi-Tenant JWT Authentication & RBAC Engine:**
  - Native Node `crypto.scrypt` password hashing with 16-byte random salts and `crypto.timingSafeEqual` comparison.
  - HMAC-SHA256 JWT generation and verification with cryptographic tamper rejection and expiry enforcement.
  - Authentication routes (`/api/v1/auth`): `/login`, `/register`, `/me`, `/switch-role`, `/personas`.
  - Role-based authorization middleware (`requireRole`) across all 5 clinical personas.
  - Multi-tenant isolation guard (`tenantGuard`) enforcing node-level data protection.
- **PostgreSQL 16 Schema, Migrations & Row-Level Security (RLS):**
  - DDL Migration `001_initial_schema.sql` defining 13 enterprise relational tables with foreign keys and indexes.
  - DDL Migration `002_rls_policies.sql` enforcing database-level tenant isolation on orders, dispensary inventory, dossiers, and audit trails.
  - SQL seed script `seed.sql` populating PostgreSQL with dispensary nodes, medicines, and inventory.
  - Database pool manager (`server/db/pool.ts`) with hybrid persistence fallback and `withTenantContext` RLS injection helper.
- **HIPAA & FDA Part 11 Clinical Audit Logging:**
  - Audit logging service (`server/services/audit.service.ts`) capturing immutable events for escrow authorizations, pharmacist quality sign-offs, and courier handovers.
- **Automated Verification:**
  - Automated test runner `server/tests/phase2_auth_db.test.ts` passing 12/12 test assertions.
  - Added `"test:phase2"` script in `package.json`.

---

## [1.2.0] - 2026-09-09

### Added
- **Production Express Backend (`server/`):**
  - Modular layered architecture: `config`, `constants`, `middleware`, `repositories`, `services`, `controllers`, `routes`.
  - Typed environment configuration in `server/config/env.ts`.
  - Standardized JSON API success & error envelopes with structured error codes and metadata timestamps.
  - Centralized error handler suppressing internal stack traces in production.
  - Structured request latency logger.
  - Declarative request body validation middleware.
  - Full `/api/v1` RESTful suite:
    - `GET /health` — Node uptime and operational standard verification.
    - `/api/v1/medicines` — Drug catalog and USP <711> $f_2$ bioequivalence calculations.
    - `/api/v1/orders` — Prescription checkout with two-phase escrow vault pre-authorization, 4-eye pharmacist sign-off, and courier PIN handshake.
    - `/api/v1/pharmacy` — Dispensary stock ledger, barcode scan replenishment (+50 units per scan), and cold-chain telemetry.
    - `/api/v1/manufacturers` — ANDA regulatory dossiers and volume RFQ bidding with ceiling checks.
    - `/api/v1/operations` — Exception resolution audit logs and canonical formulary dictionary registration.
    - `/api/v1/gateway` — Developer API clients, test explorer simulator, and Kafka event streaming.
  - Automated test suite (`server/tests/api.test.ts`) executing end-to-end HTTP tests with 12/12 passing assertions.
  - Vite dev server proxy configured in `vite.config.ts` mapping `/api` to `http://localhost:5000`.
  - Added `"server"` and `"test:api"` scripts in `package.json`.

---

## [1.1.0] - 2026-09-08

### Added
- **AI Governance & Context Architecture:**
  - Created [`decisions.md`](file:///d:/Agentic%20Ai/genericMed/decisions.md) containing 10 comprehensive Architectural Decision Records (ADRs) covering multi-persona RBAC, monorepo design, RLS tenant isolation, hybrid persistence, $f_2$ bioequivalence modeling, escrow vault settlement, and zero-trust security.
  - Created [`rules.md`](file:///d:/Agentic%20Ai/genericMed/rules.md) codifying strict development invariants, coding standards, folder structure rules, UI/UX consistency, git commit standards, and environment variable rules.
  - Created [`memory.md`](file:///d:/Agentic%20Ai/genericMed/memory.md) providing persistent long-term system memory, full API contract tables, database schema specifications, business rules, and technical debt log.
  - Created [`changelog.md`](file:///d:/Agentic%20Ai/genericMed/changelog.md) establishing chronological semantic version tracking.

### Changed
- Refined project metadata and documentation paths to support seamless pair programming with AI agents.
- Synchronized API contract specifications across frontend simulation components and upcoming backend endpoints.

---

## [1.0.0] - 2026-09-08

### Added
- **Initial Platform Scaffold & Multi-Persona Frontend:**
  - Initialized React 19 (`19.0.1`), Vite 6 (`6.2.3`), TypeScript (`5.8.2`), and Tailwind CSS v4 (`4.1.14`).
  - Added multi-tenant persona navigation header in [`src/components/common/Header.tsx`](file:///d:/Agentic%20Ai/genericMed/src/components/common/Header.tsx) with active badge counters for orders and operational exceptions.
  - Implemented **Patient Web/Mobile App** ([`CustomerAppView.tsx`](file:///d:/Agentic%20Ai/genericMed/src/components/customer/CustomerAppView.tsx)):
    - Brand-to-generic medicine search with instant savings percent calculation.
    - Interactive clinical modal visualizing $f_2$ similarity scores, dissolution curves, and pharmacokinetic profiles ($T_{\max}$, $C_{\max}$, AUC ratio).
    - Prescription upload drawer simulating OCR extraction of doctor NPI and active salts.
    - Cart management and multi-payment checkout with delivery time estimations.
  - Implemented **Pharmacy Store Node Console** ([`PharmacyNodeView.tsx`](file:///d:/Agentic%20Ai/genericMed/src/components/pharmacy/PharmacyNodeView.tsx)):
    - Live order fulfillment queue for Store Node #4.
    - Dispensary inventory ledger with SKU, shelf locations, and batch tracking.
    - Simulated physical barcode scanner incrementing SKU quantities.
    - 4-Eye licensed pharmacist sign-off and courier PIN handshake.
    - Real-time IoT cold-chain temperature telemetry monitoring.
  - Implemented **Manufacturer Hub** ([`ManufacturerHubView.tsx`](file:///d:/Agentic%20Ai/genericMed/src/components/manufacturer/ManufacturerHubView.tsx)):
    - ANDA regulatory dossier vault and active batch tracking.
    - Multi-pH buffer dissolution curve comparisons (pH 1.2, pH 4.5, pH 6.8).
    - Dispensary bulk volume RFQ bidding console with live lowest-bid submission.
  - Implemented **Operations Control Center** ([`OpsControlView.tsx`](file:///d:/Agentic%20Ai/genericMed/src/components/operations/OpsControlView.tsx)):
    - Marketplace conversion funnels and key operational metrics.
    - Critical exception triage (cold-chain excursions, escrow holds, stockouts).
    - Canonical formulary normalizer with approval/rejection workflows and manual salt registration modal.
  - Implemented **Developer API Gateway** ([`ApiGatewayView.tsx`](file:///d:/Agentic%20Ai/genericMed/src/components/developer/ApiGatewayView.tsx)):
    - Client API key registry with masked secrets, quotas, and scopes.
    - Interactive API Explorer executing test payloads and displaying response latency.
    - Real-time Kafka webhook event stream with partition inspection and event simulator.
  - Implemented **System Architecture View** ([`SystemArchitectureView.tsx`](file:///d:/Agentic%20Ai/genericMed/src/components/architecture/SystemArchitectureView.tsx)):
    - Interactive 5-layer visual diagram (Client, Edge/WAF, Application/Gateway, Core Services, Data/Storage).
    - Interactive node inspector revealing tech stacks, specifications, and live telemetry connections.
  - Created high-fidelity mock dataset in [`src/data/mockData.ts`](file:///d:/Agentic%20Ai/genericMed/src/data/mockData.ts) containing 770+ lines of real pharmaceutical formulations, lot numbers, and regulatory data.
  - Created core domain TypeScript definitions in [`src/types.ts`](file:///d:/Agentic%20Ai/genericMed/src/types.ts).

### Fixed
- Configured host `0.0.0.0` and port `3000` in `package.json` for proper container and browser preview compatibility.
