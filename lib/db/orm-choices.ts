/**
 * Database access uses Sequelize with the `mysql` dialect (`mysql2` driver).
 *
 * Entry points:
 * - `getSequelize()` in `sequelize.ts` – singleton connection
 * - `Organization` / `User` models in `models/`
 * - `auth-repository.ts` – signup + login queries (swap other features into similar modules)
 *
 * Migrations: apply SQL under `db/migrations/` (or add `sequelize-cli` later if you want
 * versioned Sequelize migrations).
 */

export {};
