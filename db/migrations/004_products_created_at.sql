-- Add `created_at` only if missing (`DESCRIBE products;` first).
-- mysql -u USER -p YOUR_DATABASE < db/migrations/004_products_created_at.sql
--
-- If you get ERROR 1060 Duplicate column 'created_at', skip this file and use 005 if needed.

ALTER TABLE products
  ADD COLUMN created_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3));
