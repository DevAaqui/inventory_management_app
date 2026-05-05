-- StockFlow: organizations + users (run against your MySQL database once)
-- mysql -u USER -p DATABASE < db/migrations/001_init.sql

CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  default_low_stock_threshold INT NOT NULL DEFAULT 5,
  created_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  updated_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  organization_id VARCHAR(36) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  updated_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY users_email_unique (email),
  KEY users_organization_id_idx (organization_id),
  CONSTRAINT users_organization_fk FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);
