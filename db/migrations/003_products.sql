-- Products (tenant-scoped). Composite UNIQUE (organization_id, sku) enforces SKU uniqueness
-- per org and supports efficient WHERE organization_id = ? (leftmost index prefix).
-- mysql -u USER -p DATABASE < db/migrations/003_products.sql
--
-- If this file ever ran when it did NOT include created_at/updated_at, MySQL kept the old
-- table shape. Use db/migrations/004_products_created_at.sql and/or
-- db/migrations/005_products_updated_at.sql (see README) for missing columns.

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(128) NOT NULL,
  description TEXT NULL,
  quantity_on_hand INT NOT NULL DEFAULT 0,
  cost_price DECIMAL(12, 2) NULL,
  selling_price DECIMAL(12, 2) NULL,
  low_stock_threshold INT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  updated_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY products_organization_sku_unique (organization_id, sku),
  CONSTRAINT products_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);
