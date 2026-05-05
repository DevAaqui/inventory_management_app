-- Stock change audit (FR-5): who/when/note for quantity adjustments.
-- mysql -u USER -p DATABASE < db/migrations/006_products_stock_audit.sql

ALTER TABLE products
  ADD COLUMN stock_updated_at DATETIME(3) NULL DEFAULT NULL AFTER updated_at,
  ADD COLUMN stock_updated_by_user_id VARCHAR(36) NULL DEFAULT NULL AFTER stock_updated_at,
  ADD COLUMN stock_update_note TEXT NULL AFTER stock_updated_by_user_id,
  ADD CONSTRAINT products_stock_updated_by_user_fk
    FOREIGN KEY (stock_updated_by_user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE;
