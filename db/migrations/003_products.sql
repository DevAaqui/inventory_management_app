-- Products (tenant-scoped). Composite UNIQUE (organization_id, sku) enforces SKU uniqueness
-- per org and supports efficient WHERE organization_id = ? (leftmost index prefix).
-- Timestamps plus stock-change audit (who/when/note for quantity adjustments).
-- mysql -u USER -p DATABASE < db/migrations/003_products.sql
--
-- Legacy: If `products` already exists from an older schema, `CREATE TABLE IF NOT EXISTS`
-- will not add new columns—run manual ALTERs or recreate the table (see README).

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
  stock_updated_at DATETIME(3) NULL DEFAULT NULL,
  stock_updated_by_user_id VARCHAR(36) NULL DEFAULT NULL,
  stock_update_note TEXT NULL,
  UNIQUE KEY products_organization_sku_unique (organization_id, sku),
  CONSTRAINT products_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
  CONSTRAINT products_stock_updated_by_user_fk FOREIGN KEY (stock_updated_by_user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
);
