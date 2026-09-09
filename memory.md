# Project Long-Term Memory & Living State

**Project:** genericMed — Generic Medicine Marketplace & Healthcare Operating System  
**Repository:** `genericMed`  
**Current Version:** 1.1.0  
**Last Updated:** 2026-09-08  
**Architecture Topology:** Production Topology v3.1 (Multi-Tenant SaaS / Edge & Microservice Mesh)

---

## 1. Project Overview

**genericMed** is a clinical-grade, multi-tenant generic medicine marketplace and healthcare operating system. It directly connects healthcare consumers/patients, licensed retail pharmacy dispensary nodes, pharmaceutical manufacturers, and healthcare API clients (EHRs, PBMs) into a unified, transparent supply and substitution network.

### Core Value Propositions
1. **Bioequivalent Drug Substitution:** Replaces high-cost originator brand medications with therapeutically identical, FDA AB-rated generic alternatives, yielding 70%–85% cost savings for patients.
2. **Clinical Equivalence Verification:** Calculates USP <711> dissolution similarity factors ($f_2$ scores), compares full pharmacokinetic profiles ($T_{\max}$, $C_{\max}$, AUC ratios), and surfaces clinical rationales.
3. **Smart Dispensary Node Operations:** Equips neighborhood retail pharmacies with real-time barcode scanning verification, cold-chain IoT temperature excursion alerts, and a 4-eye pharmacist digital sign-off protocol.
4. **Escrow Payment Vault:** Secures consumer funds in escrow upon checkout and only settles payout to the pharmacy once physical batch validation and courier PIN handshake are confirmed.
5. **Direct Manufacturer RFQ Bidding:** Enables licensed pharmaceutical manufacturers (e.g., Zydus, Sun Pharma, USV) to upload regulatory ANDA dossiers and bid directly on high-volume dispensary supply contracts.
6. **HL7 FHIR R4 & Telemetry Gateway:** Exposes standardized healthcare APIs and Kafka webhook event streams to EHR systems (DocPulse, Epic, Cerner) and third-party developers.

---

## 2. Technology Stack

### Frontend Application
- **Framework:** React 19 (`19.0.1`)
- **Build Tool:** Vite 6 (`6.2.3`)
- **Language:** TypeScript (`~5.8.2`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` `^4.1.14`)
- **Icons:** Lucide React (`0.546.0`)
- **Animations:** Motion (`12.23.24`)
- **AI Multimodal SDK:** `@google/genai` (`^2.4.0`)
- **Development Server:** `http://localhost:3000` (host: `0.0.0.0`)

### Backend Server & Infrastructure
- **Runtime:** Node.js (v20+ LTS) with `tsx` (`^4.21.0`)
- **Web Framework:** Express (`^4.21.2`)
- **API Protocol:** RESTful JSON, HL7 FHIR R4 mapping, Server-Sent Events / WebSockets
- **Environment Management:** `dotenv` (`^17.2.3`)
- **Planned Persistence:** PostgreSQL 16 (ACID ledgers & Row-Level Security), Redis 7.2 (formulary cache & rate limits), AWS S3 / GCS (AES-256 encrypted medical vault)
- **Event Bus:** Apache Kafka / Redis PubSub topic emulation for real-time telemetry
- **Port:** `http://localhost:5000` (proxied via Vite `/api`)

---

## 3. Features Completed

| Persona / Module | Feature Description | Status |
| :--- | :--- | :--- |
| **Customer App** | Interactive medicine search with real-time brand-to-generic matching | Completed |
| **Customer App** | Bioequivalent savings calculation (e.g., 79% savings on Glycomet vs. Glucophage) | Completed |
| **Customer App** | In-depth clinical modal showing $f_2$ scores, PK profiles ($T_{\max}$, $C_{\max}$), and dissolution curves | Completed |
| **Customer App** | Simulated prescription OCR drawer identifying doctor NPI and extracting salts | Completed |
| **Customer App** | Cart management, dispensing fee calculations, and multi-payment checkout (Apple Pay, Card, HSA) | Completed |
| **Pharmacy Node** | Live dispensary console for Store Node #4 with active order queues and inventory ledger | Completed |
| **Pharmacy Node** | Interactive barcode scanner simulation updating SKU stock quantities (+50 units per scan) | Completed |
| **Pharmacy Node** | 4-Eye pharmacist digital sign-off and courier PIN handover verification workflow | Completed |
| **Pharmacy Node** | Real-time cold-chain temperature telemetry monitoring (2.4°C – 4.8°C normal range) | Completed |
| **Manufacturer Hub** | Regulatory dossier vault tracking ANDA filings, FDA approval statuses, and active batches | Completed |
| **Manufacturer Hub** | Multi-pH dissolution comparison charts (pH 1.2, pH 4.5, pH 6.8 buffer release) | Completed |
| **Manufacturer Hub** | Bulk dispensary volume RFQ bidding console with live lowest-bid price updates | Completed |
| **Operations Center** | Executive marketplace overview with conversion funnel, revenue, and active node stats | Completed |
| **Operations Center** | Critical operational exception triage (cold-chain excursions, escrow holds, stockouts) | Completed |
| **Operations Center** | Canonical formulary dictionary normalizer (approve/reject raw-to-canonical salt mappings) | Completed |
| **Operations Center** | "Add Canonical Salt" modal pushing new INN definitions to marketplace formulary | Completed |
| **API Gateway** | Developer API client directory with masked keys, RPM quotas, and active OAuth scopes | Completed |
| **API Gateway** | Interactive API Explorer sending test requests and displaying formatted JSON responses | Completed |
| **API Gateway** | Real-time Kafka webhook event stream with partition inspection and simulation trigger | Completed |
| **Architecture View**| Interactive 5-layer system architecture canvas with live node telemetry inspector | Completed |
| **AI Context System** | `decisions.md`, `rules.md`, `memory.md`, and `changelog.md` established | Completed |
| **Core Express Backend** | Production Express server (`server/`) with layered config, middleware, and request logging | Completed |
| **Formulary & Bioequivalence API** | REST endpoints (`/api/v1/medicines`) implementing USP <711> $f_2$ calculations & PK profiles | Completed |
| **Orders & Escrow API** | Endpoints (`/api/v1/orders`) implementing escrow pre-authorization, 4-eye sign-off & courier release | Completed |
| **Dispensary Node API** | Stock ledger queries, cold-chain telemetry, and barcode scan replenishment (`/api/v1/pharmacy`) | Completed |
| **Manufacturer Hub API** | ANDA regulatory dossiers & competitive volume RFQ bidding (`/api/v1/manufacturers`) | Completed |
| **Operations Center API** | Operational exception triage & canonical salt dictionary registration (`/api/v1/operations`) | Completed |
| **Developer Gateway API** | Client registry, test explorer simulation, and Kafka event emission (`/api/v1/gateway`) | Completed |
| **Automated Test Suite** | Full automated HTTP test runner (`server/tests/api.test.ts`) with 12/12 passing tests | Completed |

---

## 4. Pending Features & Engineering Roadmap

- [x] **Production Express Backend Bootstrap:** Dedicated Express application in `/server` mounting routes under `/api/v1`.
- [x] **Formulary & Bioequivalence API:** REST endpoints serving active medicines, PK metrics, and dissolution curves.
- [x] **Dispensary & Orders API:** Endpoints handling escrow creation, pharmacist sign-off, and barcode verification.
- [x] **Manufacturer RFQ Service:** Backend endpoints for dossier submission and RFQ bidding with concurrency protection.
- [x] **Automated Test Suite:** Integration tests validating $f_2$ calculations, order state transitions, and authorization.
- [ ] **Gemini OCR Backend Integration:** Server-side proxy using `@google/genai` to analyze uploaded prescription images securely.
- [ ] **Persistent Database Adapters:** PostgreSQL client with migrations and repository implementations.
- [ ] **JWT Authentication & Role Middleware:** Cryptographic tenant scope injection and token verification.

---

## 5. API Endpoints Contract Summary

Base URL: `/api/v1`

### 5.1 Medicines & Formulary
- `GET /api/v1/medicines` — List all generic medicines with pricing and inventory status.
- `GET /api/v1/medicines/:id` — Retrieve detailed drug specification, dissolution curve, and PK profile.
- `POST /api/v1/medicines/bioequivalent-search` — Query by brand or salt name; returns sorted generic matches with $f_2$ metrics.

### 5.2 Orders & Escrow
- `GET /api/v1/orders` — List pharmacy orders (filterable by status, patient, node ID).
- `GET /api/v1/orders/:id` — Get single order status, items, and verification audit trail.
- `POST /api/v1/orders/checkout` — Create new prescription order and pre-authorize escrow vault funds.
- `POST /api/v1/orders/:id/verify-item` — Toggle pharmacist verification for a specific order item.
- `POST /api/v1/orders/:id/pharmacist-signoff` — Licensed pharmacist signs off order (`status: packaged`).
- `POST /api/v1/orders/:id/courier-handover` — Courier enters PIN to confirm dispatch (`status: dispatched`) and release escrow.

### 5.3 Pharmacy Dispensary Node
- `GET /api/v1/pharmacy/inventory` — List dispensary SKUs, shelf locations, batch numbers, and stock levels.
- `POST /api/v1/pharmacy/scan-stock` — Scan barcode SKU/batch number to increment inventory.
- `GET /api/v1/pharmacy/telemetry` — Fetch real-time cold-chain sensor data and node availability.

### 5.4 Manufacturer Hub
- `GET /api/v1/manufacturers/dossiers` — Retrieve ANDA regulatory dossiers and dissolution data.
- `GET /api/v1/manufacturers/rfqs` — List open dispensary volume RFQs.
- `POST /api/v1/manufacturers/rfqs/:id/bid` — Submit a competitive price bid for bulk allocation.

### 5.5 Operations Control Tower
- `GET /api/v1/operations/exceptions` — List system exceptions (cold-chain, escrow holds, stockouts).
- `POST /api/v1/operations/exceptions/:id/resolve` — Mark exception as investigated and resolved.
- `GET /api/v1/operations/canonical-mappings` — List raw query to canonical salt mapping suggestions.
- `POST /api/v1/operations/canonical-mappings/:id/decision` — Approve or reject canonical mapping.
- `POST /api/v1/operations/canonical-mappings` — Add a new manual canonical salt entry.

### 5.6 Developer & Telemetry
- `GET /api/v1/gateway/clients` — List registered API clients and usage metrics.
- `GET /api/v1/gateway/events` — Fetch live Kafka webhook event stream.
- `POST /api/v1/gateway/events/emit` — Simulate emission of a Kafka topic event.

---

## 6. Database Schema Summary

The relational schema is organized into clean domain tables:

```text
[ medicines ] ──────────────< [ dissolution_curves ]
      │
      ├─────────────────────< [ pk_profiles ]
      │
      ▼
[ pharmacy_stock ] ─────────< [ stock_batches ]
      │
      ▼
[ order_items ] ────────────> [ pharmacy_orders ] ──────────< [ escrow_transactions ]
                                      │
                                      ▼
                             [ audit_trail_events ]

[ manufacturer_dossiers ] ──< [ active_batches ]
[ rfq_contracts ] ──────────< [ rfq_bids ]
[ operational_exceptions ]
[ canonical_mappings ]
[ api_clients ]
```

### Key Table Definitions

#### `medicines`
- `id` (VARCHAR PK): Unique identifier (e.g., `'med-glycomet-500'`).
- `brand_name` (VARCHAR): Commercial generic name.
- `originator_brand` (VARCHAR): Innovator reference drug (e.g., `'Glucophage XR'`).
- `originator_manufacturer` (VARCHAR): Innovator company (e.g., `'Bristol-Myers Squibb'`).
- `generic_name` (VARCHAR): Official INN salt name.
- `active_salt` (VARCHAR): Molecular salt with CAS registry.
- `cas_number` (VARCHAR): CAS registry number.
- `dosage` (VARCHAR): Formulation strength.
- `form` (VARCHAR): Delivery vehicle (Tablet, Capsule, Liquid).
- `brand_price` (DECIMAL): Innovator retail price in USD.
- `generic_price` (DECIMAL): genericMed marketplace price in USD.
- `savings_percent` (INTEGER): Calculated percentage difference.
- `bioequivalent_score` (DECIMAL): In-vivo bioequivalence metric (e.g., `99.4`).
- `f2_similarity_metric` (DECIMAL): USP dissolution similarity factor (e.g., `78.4`).
- `orange_book_rating` (VARCHAR): FDA equivalence code (e.g., `'AB-Rated Equivalent'`).
- `prescription_required` (BOOLEAN): Prescription requirement flag.

#### `pharmacy_orders`
- `id` (VARCHAR PK): Internal order identifier.
- `order_number` (VARCHAR UNIQUE): Human-readable tracking number (e.g., `'ORD-98241'`).
- `patient_name` (VARCHAR): Patient full name.
- `address` (TEXT): Delivery address.
- `doctor_name` (VARCHAR): Prescribing physician.
- `doctor_npi` (VARCHAR): National Provider Identifier (10-digit).
- `total_amount` (DECIMAL): Total order amount.
- `savings_amount` (DECIMAL): Total savings vs. originator brands.
- `status` (ENUM): `'action_required'`, `'dispensing'`, `'packaged'`, `'dispatched'`.
- `prescription_verified` (BOOLEAN): Doctor prescription verification status.
- `pharmacist_signed` (BOOLEAN): 4-Eye pharmacist digital signature flag.
- `pharmacist_name` (VARCHAR): Signing pharmacist's license identity.
- `courier_name` (VARCHAR): Assigned logistics partner.
- `courier_pin` (VARCHAR): 4-digit one-time handshake PIN.
- `courier_handover_done` (BOOLEAN): Handshake confirmation flag.

#### `escrow_transactions`
- `id` (VARCHAR PK): Escrow transaction ID (`'ESC-904128'`).
- `order_id` (VARCHAR FK): Reference to `pharmacy_orders.id`.
- `amount` (DECIMAL): Escrow hold balance.
- `status` (ENUM): `'held'`, `'released'`, `'refunded'`, `'disputed'`.
- `release_trigger` (VARCHAR): Event unlocking funds (`'COURIER_HANDOVER'`).
- `authorized_at` (TIMESTAMP): Authorization time.
- `settled_at` (TIMESTAMP): Settlement time.

---

## 7. Important Business Logic & Clinical Rules

1. **USP <711> Bioequivalence Rule:**
   - Any generic medicine offered as an AB-rated substitute must have an $f_2$ dissolution score $\ge 50.0$.
   - The 90% confidence interval for AUC ratio and $C_{\max}$ must fall within the regulatory window of $80.0\% - 125.0\%$.
2. **Escrow Pre-Authorization & Release Rule:**
   - Patient payment authorization occurs at checkout.
   - Funds remain in a segregated escrow hold until **both** `pharmacist_signed == true` and `courier_handover_done == true`.
   - If an order is canceled or rejected by the pharmacist, funds are refunded immediately to the patient.
3. **Dispensary Cold-Chain Excursion Rule:**
   - Cold-chain medicines (e.g., insulin, biologics) require storage between 2.0°C and 8.0°C.
   - Any sensor reading exceeding 8.0°C for $>15$ continuous minutes triggers a `critical` severity operational exception and automatically places associated inventory batches in `quarantine` status.
4. **Canonical Salt Mapping Drift:**
   - When external search terms achieve a confidence score $\ge 0.95$ across $>50$ user queries, the term is automatically queued for pharmacist review in the Ops Control Tower.
   - Once approved, the synonym is pushed to the Redis search cache.

---

## 8. Known Issues & Technical Debt

- **Client-Side Mock Persistence:** In the prototype frontend, order updates, bids, and scans mutate local component React state. Browser refreshes reset data to the baseline constants in `mockData.ts`. (Resolved by connecting to backend server).
- **OCR Real File Ingestion:** The current prescription OCR in `CustomerAppView` simulates latency via `setTimeout`. Server-side Gemini vision extraction needs to be hooked up to process real image uploads.
- **WebSocket Reconnection Logic:** Real-time telemetry is currently simulated through state intervals. Real WebSockets or Server-Sent Events should replace client timers.

---

## 9. Future Roadmap

### Phase 1: Core API & Express Backend (Current)
- Stand up production Express server in `server/`.
- Implement layered routes, controllers, services, and repositories.
- Add input validation, error handling middleware, and automated unit/integration tests.

### Phase 2: Database Persistence & Auth
- Connect PostgreSQL with migrations and Row-Level Security policies.
- Connect Redis for formulary caching and distributed locks.
- Implement JWT authentication with role-based authorization headers.

### Phase 3: AI Prescription Extraction & Gateway Expansion
- Integrate `@google/genai` on server side for automated prescription transcription and safety validation.
- Implement HL7 FHIR R4 export endpoint for hospital EHR integration.
- Implement live WebSockets for store node cold-chain telemetry and delivery courier GPS updates.
