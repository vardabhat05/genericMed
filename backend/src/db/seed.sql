-- ====================================================================
-- genericMed - Production PostgreSQL Seed Data
-- ====================================================================

-- 1. Pharmacy Node #4
INSERT INTO pharmacy_nodes (id, name, dea_license, address, city, state, zip, cold_chain_temp, status)
VALUES (
  'STORE-NODE-004',
  'Apollo Pharmacy - Downtown Hub',
  'DEA TX-9042-FD',
  '401 Congress Ave, Suite 120',
  'Austin',
  'TX',
  '78701',
  3.4,
  'operational'
) ON CONFLICT (id) DO NOTHING;

-- 2. Initial Medicines
INSERT INTO medicines (
  id, brand_name, originator_brand, originator_manufacturer, generic_name, active_salt,
  cas_number, dosage, form, manufacturer, brand_price, generic_price, savings_percent,
  bioequivalent_score, f2_similarity_metric, orange_book_rating, in_stock, stock_count,
  delivery_time_mins, prescription_required, description, clinical_rationale, pk_profile, dissolution_curve
) VALUES
(
  'med-glycomet-500',
  'Glycomet 500mg ER',
  'Glucophage XR',
  'Bristol-Myers Squibb',
  'Metformin Hydrochloride ER',
  'Metformin HCl (CAS: 1115-70-4)',
  '1115-70-4',
  '500 mg Extended Release',
  'Tablet (Strip of 10)',
  'USV Private Ltd (FDA cGMP Reg #10892)',
  23.00,
  4.80,
  79.00,
  99.40,
  78.40,
  'AB-Rated Equivalent',
  TRUE,
  420,
  35,
  TRUE,
  'First-line anti-hyperglycemic biguanide for Glycemic management in Type 2 Diabetes Mellitus with gastro-retentive extended release matrix.',
  'Glycomet 500mg ER provides identical molecular API salt purity with equal Cmax (1.8 µg/mL) and equivalent AUC within strict 90% CI of 80.0-125.0%.',
  '{"tmaxHours": 4.2, "cmaxUgl": 1.82, "aucRatio": 0.994, "halfLifeHours": 6.2}'::JSONB,
  '[{"timeMins": 0, "originatorPct": 0, "genericPct": 0}, {"timeMins": 1, "originatorPct": 22, "genericPct": 21}, {"timeMins": 4, "originatorPct": 68, "genericPct": 69}, {"timeMins": 16, "originatorPct": 99, "genericPct": 98}]'::JSONB
),
(
  'med-atorva-20',
  'Atorva 20mg',
  'Lipitor 20mg',
  'Pfizer Inc.',
  'Atorvastatin Calcium',
  'Atorvastatin Calcium Trihydrate (CAS: 134523-03-8)',
  '134523-03-8',
  '20 mg Film-Coated',
  'Tablet (Strip of 15)',
  'Zydus Lifesciences Ltd (LIC: G/25/1842)',
  38.50,
  6.20,
  84.00,
  99.10,
  76.80,
  'AB-Rated Equivalent',
  TRUE,
  680,
  35,
  TRUE,
  'HMG-CoA reductase inhibitor indicated for reduction of elevated total cholesterol, LDL-C, Apo B, and triglycerides.',
  'Molecular stereoisomer equivalence validated against Lipitor Reference Standard.',
  '{"tmaxHours": 1.5, "cmaxUgl": 28.4, "aucRatio": 0.991, "halfLifeHours": 14.0}'::JSONB,
  '[{"timeMins": 0, "originatorPct": 0, "genericPct": 0}, {"timeMins": 10, "originatorPct": 35, "genericPct": 37}, {"timeMins": 30, "originatorPct": 88, "genericPct": 87}, {"timeMins": 45, "originatorPct": 97, "genericPct": 96}]'::JSONB
) ON CONFLICT (id) DO NOTHING;

-- 3. Dispensary Inventory
INSERT INTO pharmacy_inventory (
  id, node_id, sku, name, active_salt, dosage, stock_qty, reserved_qty, reorder_point,
  batch_number, expiry_date, shelf_location, unit_cost, selling_price, status
) VALUES
(
  'inv-001',
  'STORE-NODE-004',
  'GM-500-ER',
  'Glycomet 500mg ER',
  'Metformin HCl 500mg',
  '500mg ER Tab',
  420,
  18,
  80,
  'LOT-USV-8821',
  '11/2027',
  'Bay C-4 (Shelf 2)',
  2.10,
  4.80,
  'optimal'
),
(
  'inv-002',
  'STORE-NODE-004',
  'ATV-020-CL',
  'Atorva 20mg',
  'Atorvastatin Calcium 20mg',
  '20mg FC Tab',
  680,
  32,
  100,
  'LOT-ZYD-4419',
  '08/2027',
  'Bay A-1 (Shelf 1)',
  2.90,
  6.20,
  'optimal'
) ON CONFLICT (id) DO NOTHING;
