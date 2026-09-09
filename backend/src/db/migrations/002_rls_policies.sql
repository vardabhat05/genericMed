-- ====================================================================
-- genericMed - Production PostgreSQL Schema Migration 002
-- Row-Level Security (RLS) Policies
-- Compliance: Multi-Tenant Tenant Isolation & HIPAA Security Rule
-- ====================================================================

-- 1. Enable RLS on Tenant-Sensitive Tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturer_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Orders RLS Policy
-- Operations tower has global access; pharmacies see their dispensary node orders; patients see their own tenant orders.
DROP POLICY IF EXISTS orders_isolation_policy ON orders;
CREATE POLICY orders_isolation_policy ON orders
  FOR ALL
  USING (
    current_setting('app.current_role', true) = 'operations'
    OR tenant_id = current_setting('app.current_tenant', true)
    OR node_id = current_setting('app.current_node', true)
  )
  WITH CHECK (
    current_setting('app.current_role', true) = 'operations'
    OR tenant_id = current_setting('app.current_tenant', true)
    OR node_id = current_setting('app.current_node', true)
  );

-- 3. Pharmacy Dispensary Inventory RLS Policy
-- A licensed pharmacy store node can only view and mutate stock in its own node scope.
DROP POLICY IF EXISTS inventory_node_isolation_policy ON pharmacy_inventory;
CREATE POLICY inventory_node_isolation_policy ON pharmacy_inventory
  FOR ALL
  USING (
    current_setting('app.current_role', true) = 'operations'
    OR node_id = current_setting('app.current_node', true)
  )
  WITH CHECK (
    current_setting('app.current_role', true) = 'operations'
    OR node_id = current_setting('app.current_node', true)
  );

-- 4. Manufacturer Regulatory Dossiers RLS Policy
-- Manufacturers only access their proprietary ANDA dossiers and dissolution formulations.
DROP POLICY IF EXISTS manufacturer_dossier_isolation_policy ON manufacturer_dossiers;
CREATE POLICY manufacturer_dossier_isolation_policy ON manufacturer_dossiers
  FOR ALL
  USING (
    current_setting('app.current_role', true) = 'operations'
    OR manufacturer_tenant_id = current_setting('app.current_tenant', true)
  )
  WITH CHECK (
    current_setting('app.current_role', true) = 'operations'
    OR manufacturer_tenant_id = current_setting('app.current_tenant', true)
  );

-- 5. Audit Logs RLS Policy
-- Tenants can only read audit trails generated within their tenant boundary; operations can review all.
DROP POLICY IF EXISTS audit_logs_isolation_policy ON audit_logs;
CREATE POLICY audit_logs_isolation_policy ON audit_logs
  FOR SELECT
  USING (
    current_setting('app.current_role', true) = 'operations'
    OR tenant_id = current_setting('app.current_tenant', true)
  );
