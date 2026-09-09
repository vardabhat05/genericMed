# Project Rules & Development Invariants (AI Governance)

**Project:** genericMed — Generic Medicine Marketplace & Healthcare Operating System  
**Repository:** `genericMed`  
**Applies To:** AI Coding Assistants, Core Engineers, Contributors  
**Status:** Mandatory  

This document defines the strict, binding rules and standards that **any AI coding assistant or software engineer MUST follow** when working on the `genericMed` codebase. These rules ensure architectural integrity, security, clinical regulatory compliance, and consistent developer ergonomics.

---

## 1. Prime Directive: Functionality Preservation

> [!CAUTION]
> **NEVER BREAK EXISTING FUNCTIONALITY UNLESS EXPLICITLY REQUESTED.**

1. **Zero Unintentional Regressions:** Never delete, break, or disable existing screens, mock datasets, navigation paths, or interactive widgets (e.g., barcode scanner simulation, OCR drawer, f2 dissolution curves, RFQ bidding modal, API explorer, or Kafka event stream).
2. **Backward Compatibility:** All new APIs, data models, or refactorings must remain 100% compatible with the existing frontend views (`CustomerAppView`, `PharmacyNodeView`, `ManufacturerHubView`, `OpsControlView`, `ApiGatewayView`, `SystemArchitectureView`).
3. **Preserve Domain Types:** Do not arbitrarily alter or remove existing interfaces in `src/types.ts`. If an interface needs extension, add optional fields or create backward-compatible extensions.
4. **Mock Data Integrity:** The high-fidelity seed data in `src/data/mockData.ts` serves as both demonstration fixtures and test baselines. Do not overwrite or corrupt it with empty or stubbed arrays.

---

## 2. Coding Standards

### 2.1 TypeScript & Type Safety
- **Strict Mode:** Always adhere to TypeScript strict mode. Never introduce `any` types unless interfacing with an untyped legacy library, and even then, encapsulate it with a type guard.
- **Explicit Return Types:** All service functions, API route handlers, and utility methods must have explicit return types.
- **Null & Undefined Safety:** Check for `undefined` and `null` proactively. Use optional chaining (`?.`) and nullish coalescing (`??`) rather than risky type assertions (`!`).

### 2.2 Layered Backend Architecture
Follow the strict separation of concerns:
```text
HTTP Request
     ↓
[ Routes ]          → Map endpoints, HTTP verbs, middleware
     ↓
[ Controllers ]     → Parse request, validate parameters, invoke services, format HTTP responses
     ↓
[ Services ]        → Core business logic, clinical calculations, orchestration, transactions
     ↓
[ Repositories ]    → Data persistence, database queries, caching
     ↓
[ Database / Store] → PostgreSQL / Redis / In-memory models
```

- **No Business Logic in Controllers:** Controllers must only translate HTTP to service calls.
- **No Database Queries in Services:** Services must delegate data retrieval and updates to repositories.
- **No HTTP Objects in Services or Repositories:** Never pass `req` or `res` objects into services or repositories.

### 2.3 Error Handling & Response Formatting
All API endpoints must return a predictable, standardized envelope:
- **Success Response (2xx):**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional human-readable confirmation",
    "meta": {
      "timestamp": "2026-09-08T14:30:00.000Z",
      "executionTimeMs": 14
    }
  }
  ```
- **Error Response (4xx / 5xx):**
  ```json
  {
    "success": false,
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "Medicine with ID 'med-999' was not found in active formulary.",
      "details": []
    },
    "meta": {
      "timestamp": "2026-09-08T14:30:00.000Z"
    }
  }
  ```
- **Centralized Error Middleware:** Catch all uncaught exceptions in an Express error-handling middleware. Never allow stack traces to escape to client responses in production.

---

## 3. Folder Structure Rules

The project adopts a clean, co-located monorepo structure. Any additions must respect this organization:

```text
genericMed/
│
├── src/                                  # Frontend Application
│   ├── components/
│   │   ├── architecture/                 # Topology, blueprints, interactive node inspectors
│   │   ├── common/                       # Header, footers, shared modals, toasts
│   │   ├── customer/                     # Patient app, OCR upload, drug comparison, cart
│   │   ├── developer/                    # API gateway console, API explorer, webhook simulator
│   │   ├── manufacturer/                 # Regulatory dossiers, f2 curves, bulk RFQ bidding
│   │   ├── operations/                   # Ops control tower, exception triage, formulary matrix
│   │   └── pharmacy/                     # Dispensary node, barcode scanner, pharmacist signoff
│   ├── data/
│   │   └── mockData.ts                   # Authoritative seed dataset
│   ├── types.ts                          # Shared core domain types
│   ├── App.tsx                           # Main persona switcher & shell
│   ├── main.tsx                          # React 19 entry point
│   └── index.css                         # Tailwind CSS imports & global styles
│
├── server/                               # Backend Application (Production Express)
│   ├── config/                           # Environment variables, database, logger config
│   ├── constants/                        # HTTP status codes, error codes, role definitions
│   ├── controllers/                      # Request parsers and HTTP response handlers
│   ├── middleware/                       # Auth, RBAC, input validation, rate-limiter, error handling
│   ├── models/                           # Entity schemas (TypeScript interfaces / database schemas)
│   ├── repositories/                     # In-memory and PostgreSQL database access layers
│   ├── routes/                           # Express route definitions (/api/v1/...)
│   ├── services/                         # Business rules, f2 calculation, escrow orchestration
│   ├── utils/                            # Mathematical functions, token generators, formatters
│   ├── app.ts                            # Express application setup (middleware, CORS, routes)
│   └── index.ts                          # Server bootstrap & port listener
│
├── docs/                                 # Persistent Project Documentation
│   ├── API_CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── ...
│
├── decisions.md                          # Persistent Architectural Decision Records (ADRs)
├── rules.md                              # This file — AI & Engineering Rules
├── memory.md                             # Long-term system memory & state
├── changelog.md                          # Chronological version history
├── package.json                          # Dependencies & NPM scripts
├── tsconfig.json                         # TypeScript configuration
└── vite.config.ts                        # Vite frontend bundler & dev proxy config
```

- **No Root File Clutter:** Never create temporary files, test scripts, or scratch dumps in the root folder.
- **Modular Imports:** Group related utilities together; do not create single-line utility files.

---

## 4. Naming Conventions

Maintain strict naming consistency across languages and tiers:

| Context | Convention | Example |
| :--- | :--- | :--- |
| **React Components** | PascalCase | `CustomerAppView.tsx`, `PharmacyNodeView.tsx` |
| **Source Files (Backend)** | camelCase or kebab-case | `orderController.ts`, `bioequivalence.service.ts` |
| **Types & Interfaces** | PascalCase | `MedicineGeneric`, `PharmacyOrder`, `PortalRole` |
| **Variables & Functions** | camelCase | `calculateF2Score()`, `activeOrderCount` |
| **Constants & Enums** | UPPER_SNAKE_CASE | `DEFAULT_RATE_LIMIT_RPM`, `MAX_DELIVERY_MINS` |
| **Database Tables** | snake_case (plural) | `pharmacy_orders`, `canonical_mappings` |
| **Database Columns** | snake_case | `order_number`, `bioequivalent_score` |
| **API Endpoints** | kebab-case (plural) | `/api/v1/medicines/bioequivalent-search` |
| **CSS Classes** | Tailwind utility classes | `bg-slate-950 text-emerald-400 font-mono` |

---

## 5. UI/UX Consistency Rules

1. **Color Palette & Theme:**
   - **Backgrounds:** Deep slate tones (`bg-slate-950` base, `bg-slate-900` cards, `bg-slate-800/80` elevated surfaces).
   - **Accents by Persona:**
     - Patient / General: Emerald (`text-emerald-400`, `bg-emerald-500/20`, `border-emerald-500/40`).
     - Pharmacy Node: Blue / Cyan (`text-blue-400`, `bg-blue-500/20`).
     - Manufacturer: Purple (`text-purple-400`, `bg-purple-500/20`).
     - Operations: Emerald & Amber (`text-amber-400`, `bg-amber-500/20`).
     - Developer / Gateway: Cyan / Indigo (`text-cyan-400`, `bg-cyan-500/20`).
2. **Typography:**
   - Standard text in sans-serif (`font-sans`).
   - Technical indicators, codes, batch numbers, and timestamps in monospace (`font-mono text-xs`).
3. **Icons:**
   - Exclusively use `lucide-react`. Maintain consistent sizing (`w-4 h-4` for inline badges, `w-7 h-7` for section headers).
4. **Interactive Feedback:**
   - Every button must provide visual hover and active states.
   - Async actions (like order placement, barcode scanning, or RFQ bidding) must show immediate visual confirmation via toasts or status banners.
5. **No Visual Placeholders:**
   - Never render broken image links, empty `[TODO]` boxes, or raw `Lorem Ipsum`. Always use clinically accurate pharmaceutical terminology and numbers.

---

## 6. Git Commit Rules

Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard strictly:

### Format:
```text
<type>(<scope>): <short imperative summary>

[optional body explaining motivation and changes]
```

### Allowed Types:
- `feat`: A new user-facing feature or API endpoint.
- `fix`: A bug fix.
- `refactor`: Code restructuring without changing external behavior.
- `docs`: Documentation updates or ADR additions.
- `test`: Adding or correcting automated tests.
- `chore`: Dependency updates, build tooling, or config changes.
- `perf`: A code change that improves performance or latency.

### Commit Message Rules:
- Use lowercase for the type and scope.
- Use imperative mood: `"feat(api): add bioequivalent search endpoint"` (NOT `"added endpoint"` or `"adds endpoint"`).
- Keep the summary line under 72 characters.
- Never commit broken code that fails `npm run lint` or `tsc --noEmit`.

---

## 7. Security and Environment Variable Rules

1. **Zero Secrets in Repository:**
   - **NEVER** commit `.env`, private keys, JWT secrets, database connection strings with passwords, or API keys (`GEMINI_API_KEY`, etc.).
   - All secret templates must reside in `.env.example` with dummy values.
2. **Backend-Only Secrets:**
   - Secrets must only be read on the Node.js server via `process.env`.
   - Never prefix sensitive backend secrets with `VITE_` (which exposes them to the public browser bundle).
3. **Input Sanitization & Injection Prevention:**
   - Never concatenate raw user input into SQL queries or system commands. Use parameterized queries or ORM query builders.
   - Sanitize all string inputs against Cross-Site Scripting (XSS).
4. **Security Headers & Middleware:**
   - Use `helmet` for secure HTTP headers.
   - Configure Cross-Origin Resource Sharing (CORS) with an explicit whitelist; never use open wildcard `*` with credentials enabled in production.
   - Implement rate limiting (`express-rate-limit`) on all public ingress routes.
5. **Object-Level Authorization (Tenant Guard):**
   - Every endpoint manipulating pharmacy stock or orders must verify that the requesting user's tenant ID matches the resource's owner node.
   - Never rely on the client to send its own `role` or `tenant_id` in the request body when it can be derived from the verified JWT.

---

## 8. Development Verification Invariants

Before considering any backend module or feature complete, verify:
- [ ] `npm run lint` or `tsc --noEmit` passes with zero errors.
- [ ] Existing frontend views load and render properly with no console errors.
- [ ] All new endpoints follow the `/api/v1/` prefix and return standard JSON envelopes.
- [ ] Context documentation (`memory.md`, `changelog.md`, `decisions.md`) is updated to reflect additions.
