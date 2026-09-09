-- ====================================================================
-- genericMed - Production PostgreSQL Schema Migration 001
-- Target Database: PostgreSQL 16+
-- Compliance: FDA 21 CFR § 211 cGMP, HIPAA Security Rule, HL7 FHIR R4
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('customer', 'pharmacy', 'manufacturer', 'operations', 'developer', 'architecture')),
  tenant_id VARCHAR(64) NOT NULL,
  node_id VARCHAR(64),
  license_number VARCHAR(128),
  organization VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);

-- 2. Formulary Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
  id VARCHAR(64) PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL,
  originator_brand VARCHAR(255) NOT NULL,
  originator_manufacturer VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  active_salt VARCHAR(255) NOT NULL,
  cas_number VARCHAR(64) NOT NULL,
  dosage VARCHAR(128) NOT NULL,
  form VARCHAR(128) NOT NULL,
  manufacturer VARCHAR(255) NOT NULL,
  brand_price NUMERIC(10, 2) NOT NULL,
  generic_price NUMERIC(10, 2) NOT NULL,
  savings_percent NUMERIC(5, 2) NOT NULL,
  bioequivalent_score NUMERIC(5, 2) NOT NULL,
  f2_similarity_metric NUMERIC(5, 2) NOT NULL,
  orange_book_rating VARCHAR(64) NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_count INTEGER NOT NULL DEFAULT 0,
  delivery_time_mins INTEGER NOT NULL DEFAULT 35,
  prescription_required BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NOT NULL,
  clinical_rationale TEXT NOT NULL,
  pk_profile JSONB NOT NULL,
  dissolution_curve JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_active_salt ON medicines(active_salt);
CREATE INDEX IF NOT EXISTS idx_medicines_brand ON medicines(brand_name, originator_brand);
CREATE INDEX IF NOT EXISTS idx_medicines_be_score ON medicines(bioequivalent_score DESC);

-- 3. Pharmacy Dispensary Nodes
CREATE TABLE IF NOT EXISTS pharmacy_nodes (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dea_license VARCHAR(128) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(32) NOT NULL,
  zip VARCHAR(16) NOT NULL,
  cold_chain_temp NUMERIC(4, 1) NOT NULL DEFAULT 3.4,
  status VARCHAR(32) NOT NULL DEFAULT 'operational',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Pharmacy Dispensary Stock Ledger
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id VARCHAR(64) PRIMARY KEY,
  node_id VARCHAR(64) NOT NULL REFERENCES pharmacy_nodes(id) ON DELETE CASCADE,
  sku VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active_salt VARCHAR(255) NOT NULL,
  dosage VARCHAR(128) NOT NULL,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  reserved_qty INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 50,
  batch_number VARCHAR(128) NOT NULL,
  expiry_date VARCHAR(32) NOT NULL,
  shelf_location VARCHAR(128) NOT NULL,
  unit_cost NUMERIC(10, 2) NOT NULL,
  selling_price NUMERIC(10, 2) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'optimal' CHECK (status IN ('optimal', 'low_stock', 'depleted', 'quarantine')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_node_sku ON pharmacy_inventory(node_id, sku);
CREATE INDEX IF NOT EXISTS idx_inventory_batch ON pharmacy_inventory(batch_number);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) NOT NULL UNIQUE,
  tenant_id VARCHAR(64) NOT NULL,
  node_id VARCHAR(64) NOT NULL REFERENCES pharmacy_nodes(id),
  patient_id VARCHAR(64),
  patient_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  doctor_npi VARCHAR(32) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  savings_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN ('action_required', 'dispensing', 'packaged', 'dispatched', 'canceled')),
  prescription_verified BOOLEAN NOT NULL DEFAULT FALSE,
  pharmacist_signed BOOLEAN NOT NULL DEFAULT FALSE,
  pharmacist_name VARCHAR(255),
  courier_name VARCHAR(255),
  courier_pin VARCHAR(16),
  courier_handover_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_node_status ON orders(node_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- 6. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(128) NOT NULL,
  quantity INTEGER NOT NULL,
  batch_number VARCHAR(128) NOT NULL,
  shelf_location VARCHAR(128) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  scanned_barcode VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 7. Escrow Vault Records
CREATE TABLE IF NOT EXISTS escrow_vault_records (
  id VARCHAR(64) PRIMARY KEY,
  escrow_id VARCHAR(64) NOT NULL UNIQUE,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  authorized_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  settlement_trigger VARCHAR(64) NOT NULL DEFAULT 'COURIER_HANDOVER_CONFIRMED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_escrow_order ON escrow_vault_records(order_id);

-- 8. Manufacturer Regulatory Dossiers
CREATE TABLE IF NOT EXISTS manufacturer_dossiers (
  id VARCHAR(64) PRIMARY KEY,
  manufacturer_tenant_id VARCHAR(64) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  active_salt VARCHAR(255) NOT NULL,
  dosage VARCHAR(128) NOT NULL,
  dossier_status VARCHAR(32) NOT NULL CHECK (dossier_status IN ('draft', 'under_review', 'fda_approved', 'market_active')),
  f2_score NUMERIC(5, 2) NOT NULL,
  f1_score NUMERIC(5, 2) NOT NULL,
  fda_dossier_number VARCHAR(128) NOT NULL,
  active_batches JSONB NOT NULL DEFAULT '[]'::JSONB,
  multi_ph_dissolution JSONB NOT NULL DEFAULT '[]'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Dispensary Volume RFQs
CREATE TABLE IF NOT EXISTS rfq_contracts (
  id VARCHAR(64) PRIMARY KEY,
  rfq_code VARCHAR(64) NOT NULL UNIQUE,
  salt_name VARCHAR(255) NOT NULL,
  quantity_units INTEGER NOT NULL,
  target_max_price NUMERIC(10, 4) NOT NULL,
  requested_by VARCHAR(255) NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN ('open_bidding', 'awarded', 'closed')),
  current_lowest_bid NUMERIC(10, 4),
  winning_manufacturer VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Operational Exceptions
CREATE TABLE IF NOT EXISTS operational_exceptions (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL CHECK (severity IN ('critical', 'high', 'medium')),
  type VARCHAR(32) NOT NULL CHECK (type IN ('cold_chain', 'escrow_hold', 'mapping_drift', 'stockout')),
  title VARCHAR(255) NOT NULL,
  detail TEXT NOT NULL,
  node VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN ('unresolved', 'investigating', 'resolved')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255)
);

-- 11. Canonical Mappings
CREATE TABLE IF NOT EXISTS canonical_mappings (
  id VARCHAR(64) PRIMARY KEY,
  raw_search_term VARCHAR(255) NOT NULL,
  suggested_canonical_salt VARCHAR(255) NOT NULL,
  strength VARCHAR(128) NOT NULL,
  confidence_score NUMERIC(4, 3) NOT NULL,
  source_feed VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  date_added TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. API Gateway Clients
CREATE TABLE IF NOT EXISTS api_clients (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  client_type VARCHAR(32) NOT NULL CHECK (client_type IN ('ehr', 'pbm', 'pos', 'sdk')),
  api_key_masked VARCHAR(64) NOT NULL,
  active_scopes JSONB NOT NULL DEFAULT '[]'::JSONB,
  requests_per_min_limit INTEGER NOT NULL DEFAULT 600,
  current_rpm INTEGER NOT NULL DEFAULT 0,
  monthly_calls INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL CHECK (status IN ('active', 'throttled', 'suspended')),
  webhook_url TEXT NOT NULL
);

-- 13. Audit Logs (HIPAA & 21 CFR § 211)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_role VARCHAR(32) NOT NULL,
  action VARCHAR(128) NOT NULL,
  resource VARCHAR(128) NOT NULL,
  resource_id VARCHAR(128) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address VARCHAR(64),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON audit_logs(tenant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource, resource_id);
