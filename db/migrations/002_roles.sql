-- Roles + link users to roles (run after 001_init.sql)
-- mysql -u USER -p DATABASE < db/migrations/002_roles.sql

CREATE TABLE IF NOT EXISTS roles (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
  updated_at DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY roles_name_unique (name)
);

-- Single MVP role: owner/org admin
INSERT INTO roles (id, name) VALUES (1, 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);

ALTER TABLE users
  ADD COLUMN role_id TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER organization_id,
  ADD CONSTRAINT users_role_fk FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT ON UPDATE CASCADE;
