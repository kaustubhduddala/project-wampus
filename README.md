# Project Wampus

The official website for Project Wampus, a UT organization. The app features a merchandise store, fundraising tracking, delivery management, a heatmap visualization, sponsor listings, and role-based admin tooling.

## Tech Stack

| Layer    | Technologies                                                           |
| -------- | ---------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router |
| Backend  | Node.js, Express, Prisma ORM, Supabase Auth                            |
| Database | PostgreSQL (via Supabase)                                              |

---

## Frontend — Local Setup

**Prerequisites:** Node.js, npm

```bash
cd pjw-frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

Other available scripts:

```bash
npm run build    # Type-check and build for production
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

---

## Backend — Local Setup

**Prerequisites:** Node.js, npm

```bash
cd pjw-backend
npm install
```

Create a `.env` file in `pjw-backend/` (see [Environment Variables](#environment-variables) below), then run:

```bash
npm run dev    # Start with nodemon (auto-restarts on file changes)
npm start      # Start without nodemon
```

The server starts on port `3001` by default (`http://localhost:3001`).

### Prisma

After setting `DATABASE_URL` in your `.env`, generate the Prisma client:

```bash
npx prisma generate
```

---

## Environment Variables

### Backend (`pjw-backend/.env`)

| Variable               | Required | Description                                                   |
| ---------------------- | -------- | ------------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string (from Supabase project settings) |
| `SUPABASE_URL`         | Yes      | Supabase project URL (e.g. `https://<project>.supabase.co`)   |
| `SUPABASE_SERVICE_KEY` | Yes      | Supabase service role secret key                              |
| `PORT`                 | No       | Port for the Express server (defaults to `3001`)              |
| `CORS_ORIGIN`          | No       | Allowed CORS origin (defaults to `*`)                         |

Example `pjw-backend/.env`:

```env
DATABASE_URL="postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres"
SUPABASE_URL="https://<project>.supabase.co"
SUPABASE_SERVICE_KEY="<your-service-role-key>"
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

> **Note:** Never commit `.env` files to version control. The `SUPABASE_SERVICE_KEY` has admin-level database access and must be kept secret.

### Frontend (`pjw-frontend/.env`)

No environment variables are currently required to run the frontend locally.
