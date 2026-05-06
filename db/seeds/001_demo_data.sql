-- Demo seed: two organizations, two admin users, 11 products (mixed SKUs).
-- Prerequisites: run db/migrations/001_init.sql, 002_roles.sql, 003_products.sql
-- (002 creates the single MVP role `admin` with id = 1).
--
-- Login (both accounts): password `password123`
--
-- mysql -u USER -p DATABASE < db/seeds/001_demo_data.sql

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
INSERT INTO organizations (id, name, default_low_stock_threshold) VALUES
  ('a1111111-1111-4111-8111-111111111101', 'Acme Wholesale Co.', 5),
  ('a2222222-2222-4222-8222-222222222202', 'Globex Retail Ltd.', 8)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  default_low_stock_threshold = VALUES(default_low_stock_threshold);

-- ---------------------------------------------------------------------------
-- Users (role_id 1 = admin from 002_roles.sql)
-- Password for both: password123 (bcryptjs, 10 rounds)
-- ---------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, organization_id, role_id) VALUES
  (
    'b1111111-1111-4111-8111-111111111101',
    'alice@acme-seed.example',
    '$2b$10$VEaTJYfc0oSLOEGR8g2voeLnA/xM77tO4SIseHDDUZNA8DLAiSkzG',
    'a1111111-1111-4111-8111-111111111101',
    1
  ),
  (
    'b2222222-2222-4222-8222-222222222202',
    'bob@globex-seed.example',
    '$2b$10$VEaTJYfc0oSLOEGR8g2voeLnA/xM77tO4SIseHDDUZNA8DLAiSkzG',
    'a2222222-2222-4222-8222-222222222202',
    1
  )
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  organization_id = VALUES(organization_id),
  role_id = VALUES(role_id);

-- ---------------------------------------------------------------------------
-- Products (≥ 10 rows, varied names/SKUs/prices/stock)
-- ---------------------------------------------------------------------------
INSERT INTO products (
  id,
  organization_id,
  name,
  sku,
  description,
  quantity_on_hand,
  cost_price,
  selling_price,
  low_stock_threshold
) VALUES
  (
    'c0000001-0000-4000-8000-000000000001',
    'a1111111-1111-4111-8111-111111111101',
    'Hardcover Notebook A5',
    'ACME-NB-A5',
    'Ruled, 192 pages',
    240,
    4.50,
    9.99,
    20
  ),
  (
    'c0000002-0000-4000-8000-000000000002',
    'a1111111-1111-4111-8111-111111111101',
    'Ballpoint Pen Blue (box 50)',
    'ACME-PEN-BLU-50',
    'Smooth gel ink',
    18,
    12.00,
    24.50,
    15
  ),
  (
    'c0000003-0000-4000-8000-000000000003',
    'a1111111-1111-4111-8111-111111111101',
    'Sticky Notes 3x3 Neon',
    'ACME-STICKY-3N',
    '12 pads per carton',
    3,
    6.25,
    12.99,
    10
  ),
  (
    'c0000004-0000-4000-8000-000000000004',
    'a1111111-1111-4111-8111-111111111101',
    'Ring Binder 2"',
    'ACME-BIND-2IN',
    'D-ring, black',
    42,
    3.10,
    7.49,
    12
  ),
  (
    'c0000005-0000-4000-8000-000000000005',
    'a1111111-1111-4111-8111-111111111101',
    'Highlighter Set 6-color',
    'ACME-HI-SET6',
    'Chisel tip',
    55,
    2.80,
    6.25,
    NULL
  ),
  (
    'c0000006-0000-4000-8000-000000000006',
    'a1111111-1111-4111-8111-111111111101',
    'Desktop Stapler Heavy Duty',
    'ACME-STAP-HD',
    '25-sheet capacity',
    8,
    9.40,
    18.00,
    5
  ),
  (
    'c0000007-0000-4000-8000-000000000007',
    'a2222222-2222-4222-8222-222222222202',
    'Arabica Whole Bean 1kg',
    'GLX-COF-ARB-1K',
    'Medium roast',
    60,
    14.50,
    28.99,
    20
  ),
  (
    'c0000008-0000-4000-8000-000000000008',
    'a2222222-2222-4222-8222-222222222202',
    'Earl Grey Loose Leaf 250g',
    'GLX-TEA-EG-250',
    'Citrus bergamot',
    4,
    8.20,
    16.50,
    10
  ),
  (
    'c0000009-0000-4000-8000-000000000009',
    'a2222222-2222-4222-8222-222222222202',
    'Ceramic Mug 12oz Matte Black',
    'GLX-MUG-12-BK',
    'Dishwasher safe',
    112,
    3.50,
    8.99,
    30
  ),
  (
    'c0000010-0000-4000-8000-00000000000a',
    'a2222222-2222-4222-8222-222222222202',
    'Cane Sugar 1kg',
    'GLX-SUG-CANE-1K',
    NULL,
    200,
    1.40,
    3.29,
    50
  ),
  (
    'c0000011-0000-4000-8000-00000000000b',
    'a2222222-2222-4222-8222-222222222202',
    'Oat Barista Blend 1L',
    'GLX-OAT-BAR-1L',
    'Foamable',
    28,
    2.05,
    4.49,
    15
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  quantity_on_hand = VALUES(quantity_on_hand),
  cost_price = VALUES(cost_price),
  selling_price = VALUES(selling_price),
  low_stock_threshold = VALUES(low_stock_threshold);
