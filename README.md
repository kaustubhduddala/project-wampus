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



After pulling schema changes, run Prisma migration + client generation:

```bash
cd pjw-backend
npx prisma migrate deploy
npx prisma generate
```

### Frontend (`pjw-frontend/.env`)

No environment variables are currently required to run the frontend locally.
---

## Chatbot (RAG) — Overview

- **Location:** Backend chatbot code and ingestion script live in pjw-backend/; the frontend widget is at pjw-frontend/src/components/Chatbot.tsx.
- **What it does:** A Retrieval-Augmented Generation (RAG) chat endpoint mounted at `POST /api/chat`. It uses OpenAI embeddings + chat completions and Pinecone for vector search to ground answers and return source references.
- **Knowledge base:** System prompt is at pjw-backend/config/system_message.txt. Document sources are under pjw-backend/data/*.txt.

### Backend — Chatbot Setup

1. Add provider keys to pjw-backend/.env:
	- `OPENAI_API_KEY` — OpenAI API key.
	- `PINECONE_API_KEY` — Pinecone API key.
	- `PINECONE_INDEX_NAME` — Pinecone index name (PRD uses `projectwampus`).
2. Create a Pinecone index (manual step) with:
	- name: `projectwampus`
	- dimension: `1536`
	- metric: `cosine`
3. Run the ingestion script to index local docs:

```bash
cd pjw-backend
node scripts/ingest.js
```

This script chunks pjw-backend/data/*.txt, creates embeddings, and upserts vectors into Pinecone.

- The chat widget is at pjw-frontend/src/components/Chatbot.tsx and sends `{ question, history }` to `POST /api/chat`.

### Notes & Troubleshooting

- The backend reads pjw-backend/config/system_message.txt on each request — edit it to change assistant persona or policies.
- If the chatbot returns `500`, verify `OPENAI_API_KEY`, `PINECONE_API_KEY`, and that the Pinecone index exists.
- Rate limiting: the chat API enforces 20 requests per 60 seconds per client.

