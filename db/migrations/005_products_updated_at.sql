-- Add `updated_at` only if missing (`DESCRIBE products;` first).
-- mysql -u USER -p YOUR_DATABASE < db/migrations/005_products_updated_at.sql
--
-- If you get ERROR 1060 Duplicate column 'updated_at', skip — you are done.

ALTER TABLE products
  ADD COLUMN updated_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)) ON UPDATE CURRENT_TIMESTAMP(3);
