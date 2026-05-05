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

Create an empty database in MySQL, then apply the initial migration once:

```bash
mysql -u USER -p YOUR_DATABASE < db/migrations/001_init.sql
```

This creates `organizations` and `users` tables used by Sequelize (see `lib/db/models/`).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
