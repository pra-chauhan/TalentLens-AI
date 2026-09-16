# TalentLens AI — Production Deployment Guide

---

## 1. Cloud Run / Containerized Deployment
TalentLens AI is optimized for single-container full-stack execution where Node.js / Express serves both `/api/*` routes and static assets compiled by Vite into `dist/`.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

---

## 2. Environment Variables Checklist
Ensure these environment variables are set in your production cloud provider:
- `GEMINI_API_KEY`: Server-side API key for AI copilot, resume parsing, and interview question generation.
- `PORT`: Set to `3000`.
- `NODE_ENV`: Set to `production`.
- `DATABASE_URL`: (Optional) Connection URI to Supabase PostgreSQL with `pgvector` enabled.

---

## 3. Vercel & Render Alternative Deployment
- **Frontend**: Can be built via `npm run build` on Vercel with output directory `dist`.
- **Backend API**: Can be hosted on Render, Railway, or Google Cloud Run, proxying `/api` requests.
