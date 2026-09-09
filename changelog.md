# Changelog

All notable changes to the **genericMed** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Server-side prescription image OCR analysis using `@google/genai`.
- PostgreSQL database persistence with migrations and Row-Level Security (RLS) enforcement.
- JWT authentication with tenant context injection middleware.

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
