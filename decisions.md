# Architectural & Product Decision Log (ADR)

**Project:** genericMed — Generic Medicine Marketplace & Healthcare Operating System  
**Repository:** `genericMed`  
**Status:** Active  
**Maintained By:** Backend Engineering & Architecture Team  

This document serves as the persistent architectural decision record (ADR) for genericMed. Every significant technical, infrastructural, data-layer, regulatory, and product-level decision is documented here using structured ADR formatting.

---

## Index of Decisions

- [DEC-001: Multi-Persona Role-Based Architecture](#dec-001-multi-persona-role-based-architecture)
- [DEC-002: Monorepo Architecture for Vite Frontend & Node.js Backend](#dec-002-monorepo-architecture-for-vite-frontend--nodejs-backend)
- [DEC-003: Multi-Tenant Data Isolation with Row-Level Security (RLS)](#dec-003-multi-tenant-data-isolation-with-row-level-security-rls)
- [DEC-004: In-Memory / PostgreSQL & Redis Hybrid Persistence Model](#dec-004-in-memory--postgresql--redis-hybrid-persistence-model)
- [DEC-005: Bioequivalence Scoring & f2 Dissolution Algorithm Engine](#dec-005-bioequivalence-scoring--f2-dissolution-algorithm-engine)
- [DEC-006: Escrow Vault & 4-Eye Verification Protocol for Prescription Dispensing](#dec-006-escrow-vault--4-eye-verification-protocol-for-prescription-dispensing)
- [DEC-007: RESTful API Gateway Design & HL7 FHIR R4 Compatibility](#dec-007-restful-api-gateway-design--hl7-fhir-r4-compatibility)
- [DEC-008: Kafka Event-Driven Architecture for Telemetry & Webhooks](#dec-008-kafka-event-driven-architecture-for-telemetry--webhooks)
- [DEC-009: Server-Side Gemini AI Integration for Prescription OCR & Salt Normalization](#dec-009-server-side-gemini-api-integration-for-prescription-ocr--salt-normalization)
- [DEC-010: Zero-Trust Security, HIPAA Compliance, and 21 CFR § 211 cGMP Governance](#dec-010-zero-trust-security-hipaa-compliance-and-21-cfr--211-cgmp-governance)

---

## DEC-001: Multi-Persona Role-Based Architecture

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  Healthcare generic drug distribution involves completely disparate stakeholders:
  1. *Patients/Consumers* needing affordable generic alternatives and order tracking.
  2. *Licensed Retail Pharmacies (Store Nodes)* needing rapid inventory dispensing, barcode verification, and cold-chain monitoring.
  3. *Pharmaceutical Manufacturers (MFR Hub)* needing regulatory dossier filings (ANDA, f2 dissolution curves) and bulk RFQ bidding.
  4. *Operations & Marketplace Admins* needing triage over cold-chain exceptions, escrow locks, and canonical salt mapping drift.
  5. *Third-Party Developers & EHR Partners* integrating via APIs and webhooks.
  6. *System Architects & Auditors* verifying system topology and regulatory compliance.
  
  Building separate fragmented codebases for each persona would lead to duplicated domain logic, inconsistent drug data dictionaries, and operational silos.
- **Decision Taken:**  
  Implement a single unified, multi-tenant portal architecture with strict role segmentation (`customer`, `pharmacy`, `manufacturer`, `operations`, `developer`, `architecture`). User navigation, UI layouts, and backend API routes enforce strict role boundaries while sharing the core drug formulary, pricing engine, and order orchestration layers.
- **Reasoning:**  
  Consolidating personas into a coherent platform allows real-time end-to-end simulation (e.g., patient places order -> pharmacy node receives order and scans barcode -> operations observes escrow and courier dispatch -> manufacturer monitors aggregate salt demand).
- **Alternatives Considered:**  
  - *Completely Separate Repositories/Apps:* High maintenance overhead, high drift between mock data models, difficult paired local testing.
  - *Single generic dashboard with conditional tabs:* Cluttered UI that obscures clinical persona context.
- **Impact on Project:**  
  Clean role switching in the navigation header, shared TypeScript types in `src/types.ts`, and clear RBAC (Role-Based Access Control) expectations for the backend authentication layer.

---

## DEC-002: Monorepo Architecture for Vite Frontend & Node.js Backend

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  The project originated as an AI Studio prototype containing a full React 19 / Tailwind CSS frontend. A production-grade backend is required that provides RESTful APIs, business validation, and database operations while maintaining zero regressions on the existing frontend.
- **Decision Taken:**  
  Structure the repository as a co-located TypeScript application where:
  - Frontend runs via Vite on `http://localhost:3000`.
  - Backend runs via Express/Node.js with `tsx` runtime on `http://localhost:5000` (or proxy-configured under `/api/v1`).
  - Shared domain interfaces are maintained to ensure complete contract fidelity.
- **Reasoning:**  
  Keeps frontend and backend synchronized, eliminates cross-repo version drift, simplifies continuous integration, and allows instant testing of API calls against the mock and real databases.
- **Alternatives Considered:**  
  - *Separate git repositories for backend and frontend:* Slowed development cycle, increased context switching during prototyping.
  - *Full Next.js server-side migration:* High risk of breaking the existing React 19 / Vite / Tailwind CSS configuration and Lucide icon components.
- **Impact on Project:**  
  Vite configuration can proxy `/api` requests to the Express server, ensuring unified local development without CORS complications.

---

## DEC-003: Multi-Tenant Data Isolation with Row-Level Security (RLS)

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  Independent retail pharmacies (e.g., Apollo Pharmacy, CVS franchise nodes) and individual patients share the same physical application infrastructure. Under HIPAA and pharmacy board regulations, pharmacy nodes must never access patient records or inventory ledgers outside their licensed dispensary node.
- **Decision Taken:**  
  Adopt a tenant-aware data architecture with PostgreSQL Row Level Security (RLS) and cryptographic tenant context injection on every incoming request:
  - Ingress tokens carry `tenant_id` and `node_id` claims.
  - Database queries automatically append tenant filters (`tenant_id = current_setting('app.current_tenant')`).
- **Reasoning:**  
  Prevents lateral data leakage at the database layer even if application code inadvertently omits an explicit tenant WHERE clause.
- **Alternatives Considered:**  
  - *Schema-per-tenant:* High migration and maintenance cost across hundreds of pharmacy nodes.
  - *Database-per-tenant:* Unwieldy operational costs and connection pooling exhaustion.
  - *Application-level filtering only:* Vulnerable to developer error and injection bugs.
- **Impact on Project:**  
  Backend services and repositories must accept an execution context containing authenticated user and tenant identifiers.

---

## DEC-004: In-Memory / PostgreSQL & Redis Hybrid Persistence Model

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  The marketplace requires both ACID compliance (for financial escrow and prescription verification) and sub-20ms latency (for instant drug substitution search and real-time inventory queries across 142 live nodes).
- **Decision Taken:**  
  Implement a layered persistence architecture:
  1. *Primary Storage (PostgreSQL):* System of record for orders, regulatory dossiers, pharmacy ledgers, and audit trails.
  2. *Formulary Cache & Lock Manager (Redis):* In-memory cache for bioequivalent salt mappings, Orange Book ratings, active stock counts, rate-limiting tokens, and WebSocket pub/sub.
  3. *In-Memory Seed Fallback:* Clean in-memory repository layer initialized with high-fidelity domain seeds (`MEDICINES_DATA`, `PHARMACY_STOCK`, `INITIAL_ORDERS`) so the system boots immediately in standalone mode with zero external service dependencies.
- **Reasoning:**  
  Permits zero-setup local development and automated testing while offering a drop-in migration path to PostgreSQL/Redis clusters in production.
- **Alternatives Considered:**  
  - *Pure MongoDB:* Lacks native multi-table transactional guarantees required for escrow holds and pharmacy lot deduction.
  - *Pure SQLite:* Lacks enterprise RLS, horizontal scaling, and concurrent write performance.
- **Impact on Project:**  
  Repository pattern separates database access from business logic, allowing easy toggling between in-memory mock adapters and relational database adapters.

---

## DEC-005: Bioequivalence Scoring & f2 Dissolution Algorithm Engine

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  Generic medicine substitution cannot rely on superficial brand names. Patients and doctors require clinical assurance that generic substitutes match the originator brand in rate and extent of absorption (bioequivalence).
- **Decision Taken:**  
  Adopt the FDA / USP <711> mathematical model for bioequivalence:
  - **f2 Similarity Metric:** Calculates the similarity factor between originator and generic dissolution curves across standard sampling time points:
    $$f_2 = 50 \cdot \log_{10}\left( \left[ 1 + \frac{1}{n}\sum_{t=1}^n (R_t - T_t)^2 \right]^{-0.5} \times 100 \right)$$
    Substitution requires $f_2 \ge 50$ (ensuring 90% bioequivalent similarity).
  - **AB Rating Standard:** FDA Orange Book classification indicating therapeutic equivalence.
  - **Pharmacokinetic (PK) Profile:** Validates $T_{\max}$, $C_{\max}$, AUC ratio ($0.80 - 1.25$ confidence interval), and half-life.
- **Reasoning:**  
  Provides unassailable scientific credibility, increases patient trust, and enables automated recommendations with clinical rationale displayed directly in the UI.
- **Alternatives Considered:**  
  - *Price-only matching:* Medically irresponsible; risks therapeutic failure or adverse events.
  - *Simple salt name string matching:* Misses critical differences in formulation (e.g., immediate release vs. extended release).
- **Impact on Project:**  
  `MedicineGeneric` schema includes detailed `dissolutionCurve`, `pkProfile`, and `f2SimilarityMetric` data attributes; search API ranks results based on bioequivalent score and consumer savings.

---

## DEC-006: Escrow Vault & 4-Eye Verification Protocol for Prescription Dispensing

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  In online prescription fulfillment, financial transactions must not settle before a licensed pharmacist reviews the prescription and verifies the physical drug batch. Premature settlement risks dispensing errors, regulatory penalties, and disputed chargebacks.
- **Decision Taken:**  
  Enforce a multi-stage Escrow & Dispensing Workflow:
  1. **Pre-Authorization (Escrow Hold):** Patient checkout authorizes funds into a segregated escrow vault.
  2. **Physical Barcode Verification:** Pharmacist scans physical SKU/batch barcode at dispensary node.
  3. **Pharmacist 4-Eye Sign-Off:** Licensed pharmacist verifies doctor credentials (NPI) and digitally signs the order (`status: packaged`).
  4. **Courier Handshake (PIN Handover):** Courier enters dynamic one-time PIN upon pickup (`status: dispatched`).
  5. **Escrow Settlement:** Only upon courier handover are funds released from escrow to the pharmacy account.
- **Reasoning:**  
  Guarantees legal compliance with state pharmacy boards, eliminates dispensing errors, and builds trust between retail pharmacies and the platform.
- **Alternatives Considered:**  
  - *Direct upfront payment capture:* High liability in case of stockout, expired batch, or invalid prescription.
  - *Cash on delivery only:* High operational friction and driver theft risk.
- **Impact on Project:**  
  Order states transition explicitly: `action_required` $\rightarrow$ `dispensing` $\rightarrow$ `packaged` $\rightarrow$ `dispatched`.

---

## DEC-007: RESTful API Gateway Design & HL7 FHIR R4 Compatibility

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  The platform must integrate with third-party Electronic Health Records (EHRs like Epic, Cerner, DocPulse) and Pharmacy Benefit Managers (PBMs). Healthcare integrations mandate standard formats while internal frontends need fast JSON REST endpoints.
- **Decision Taken:**  
  Standardize backend routes under `/api/v1/` following REST conventions with JSON payloads, while supporting HL7 FHIR R4 payload mappings for clinical resources (`MedicationRequest`, `MedicationDispense`).
  Implement client API key authentication with quota enforcement (e.g., 600–1200 RPM limit) and tiered developer scopes (`read:formulary`, `write:dispense`, `read:rfq`).
- **Reasoning:**  
  Ensures seamless developer onboarding, conforms to healthcare interoperability mandates (ONC Cures Act), and protects backend services from abuse.
- **Alternatives Considered:**  
  - *Pure GraphQL:* Unnecessary complexity for retail POS barcode scanners and IoT devices.
  - *Proprietary XML protocol:* Non-standard, rejected by modern developer ecosystems.
- **Impact on Project:**  
  `ApiGatewayView` provides an interactive API Explorer testing these exact endpoints with real-time latency measurements.

---

## DEC-008: Kafka Event-Driven Architecture for Telemetry & Webhooks

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  Marketplace activities (substitution conversions, inventory depletion, cold-chain temperature excursions, and order dispatches) generate high-volume telemetry that must be asynchronously delivered to partner webhooks, audit logs, and analytics pipelines without degrading synchronous API request latency.
- **Decision Taken:**  
  Model the messaging architecture on Apache Kafka topic partitions (`dispensary.prescription.auto_substituted`, `node.coldchain.excursion`, `orders.escrow.settled`). Provide webhook delivery with retry guarantees and dead-letter queues.
- **Reasoning:**  
  Decouples the core transactional request path from downstream reporting, external webhook dispatch, and analytics indexing.
- **Alternatives Considered:**  
  - *Synchronous HTTP webhooks in request loop:* Slows user response times; fails if external recipient is temporarily offline.
  - *Standard Cron polling:* High database load, high latency, poor scalability.
- **Impact on Project:**  
  Telemetry views and developer portal include event stream monitors with partition and delivery status inspection.

---

## DEC-009: Server-Side Gemini AI Integration for Prescription OCR & Salt Normalization

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  Prescriptions uploaded by patients are unstructured photos of handwritten or printed doctor orders. Additionally, drug search queries contain trade names, misspellings, or unmapped manufacturer abbreviations that fail rigid SQL string searches.
- **Decision Taken:**  
  Utilize Google Gemini AI (`@google/genai`) strictly on the server side:
  - **Prescription OCR & Extraction:** Extracts prescriber NPI, patient details, and detected drug salts.
  - **Canonical Salt Normalization:** Resolves noisy search terms (e.g., "glyco met 500 er") to verified canonical INN salts (e.g., "Metformin Hydrochloride ER, CAS 1115-70-4").
  - **API Key Security:** The `GEMINI_API_KEY` is kept strictly on the backend and never exposed to the client bundle.
- **Reasoning:**  
  Gemini provides state-of-the-art multimodal vision and medical terminology understanding. Keeping calls server-side ensures API keys remain confidential and prompts are protected.
- **Alternatives Considered:**  
  - *Client-side Gemini calls:* Leaks API keys to the browser, violates HIPAA data handling best practices.
  - *Tesseract OCR:* High error rates on handwritten doctor prescriptions.
- **Impact on Project:**  
  `package.json` includes `@google/genai`; `.env.example` documents `GEMINI_API_KEY`; backend provides an OCR analysis proxy endpoint.

---

## DEC-010: Zero-Trust Security, HIPAA Compliance, and 21 CFR § 211 cGMP Governance

- **Date:** 2026-09-08
- **Status:** Accepted
- **Context/Problem:**  
  genericMed handles Protected Health Information (PHI) and operates within regulated pharmaceutical supply chains. Non-compliance risks severe civil and criminal penalties from the FDA and HHS.
- **Decision Taken:**  
  Establish zero-trust security invariants across the backend:
  1. *Encrypted at Rest & in Transit:* TLS 1.3 for all HTTP/WebSocket traffic; AES-256-GCM for prescription images in S3 Vault.
  2. *Immutable Audit Logging:* Every order status change, pharmacist sign-off, and prescription view generates a tamper-evident audit record with timestamp, user ID, role, and IP address.
  3. *Zero Exposure of Secrets:* No passwords, hashes, JWT secrets, or cloud keys in source control or client responses.
  4. *Rigorous Input Sanitization:* All request bodies validated against strict schemas before service execution.
- **Reasoning:**  
  Mandatory for healthcare enterprise adoption, regulatory compliance, and patient data safety.
- **Alternatives Considered:**  
  - *Ad-hoc logging:* Fails HIPAA audit compliance.
  - *Optional encryption:* Unacceptable in healthcare systems.
- **Impact on Project:**  
  All models include audit fields; centralized error handling strips stack traces in non-development environments.
