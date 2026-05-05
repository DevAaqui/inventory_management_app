# StockFlow (inventory_management_app)

Next.js app with **MySQL**, **Sequelize**, **HeroUI**, and **Tailwind CSS v4**.

## Prerequisites

- **Node.js** 20+ (matches Next.js 16)
- **MySQL** 8.x (or compatible) with a database you can connect to

## Project setup

### 1. Install dependencies

```bash
cd inventory_management_app
npm install
```

### 2. Environment variables

Copy the sample file and edit `.env`:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL URL: `mysql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `SESSION_PASSWORD` | Secret for **iron-session** (must be **≥ 32 characters**). Use a random value in production (e.g. `openssl rand -base64 32`). |

See [.env.example](.env.example) for placeholders.

### 3. Database schema

Create an empty database in MySQL, then apply migrations **in order**:

```bash
mysql -u USER -p YOUR_DATABASE < db/migrations/001_init.sql
mysql -u USER -p YOUR_DATABASE < db/migrations/002_roles.sql
mysql -u USER -p YOUR_DATABASE < db/migrations/003_products.sql
```

If `products` already existed from an **older** `003` without timestamps, `CREATE TABLE IF NOT EXISTS` will **not** add new columns. Check with `DESCRIBE products;`, then run **only** the fix you need:

```bash
# Missing created_at only (ignore “Duplicate column” for the other):
mysql -u USER -p YOUR_DATABASE < db/migrations/004_products_created_at.sql
mysql -u USER -p YOUR_DATABASE < db/migrations/005_products_updated_at.sql
```

If `created_at` **already exists** but `updated_at` does not (error **Duplicate column 'created_at'** when running a combined `ALTER`), run **only**:

```bash
mysql -u USER -p YOUR_DATABASE < db/migrations/005_products_updated_at.sql
```

If a migration reports a duplicate column for the column it adds, skip that file.

`001` / `002` create organizations, roles (with `admin`), and users.  
`003` adds `products` with **`UNIQUE (organization_id, sku)`** so SKUs are unique per org and `WHERE organization_id = ?` can use that index’s leftmost prefix (no separate index on `organization_id` only).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll be sent to **Log in**; use **Sign up** to create an organization and first user.

### Production build (optional)

```bash
npm run build
npm run start
```

## Stack overview

- **App:** Next.js (App Router), React 19, TypeScript  
- **UI:** HeroUI v3, Tailwind CSS v4  
- **Data:** Sequelize + `mysql2`  
- **Auth/session:** `iron-session` (when wired to UI); passwords hashed with `bcryptjs`

## Learn more

- [Next.js documentation](https://nextjs.org/docs)  
- [HeroUI v3](https://www.heroui.com/docs/react/getting-started/quick-start)  
- [Sequelize](https://sequelize.org/docs/v6/)
