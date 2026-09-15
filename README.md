# Bhagi Geet 🎵

A real-time, synchronized bhajan singing platform. Features instant room creation, live lyrics sync, voting, auto-queuing, and a dedicated mobile-friendly singing mode.

Built with **Next.js 14**, **Tailwind CSS**, **Node.js**, **Socket.io**, and **PostgreSQL (Supabase)**.

## 🚀 Quick Start (Localhost)

1. Create a free PostgreSQL database on [Supabase](https://supabase.com).
2. Run the SQL script located in `backend/src/db/schema.sql` in your Supabase SQL Editor.
3. Get your connection string (Connection Pooler URL).
4. Set up environment variables:
   - In `/backend`, copy `.env.example` to `.env` and add your `DATABASE_URL`.
   - In `/frontend`, copy `.env.local.example` to `.env.local`.
5. Install dependencies and start the app:
   ```bash
   npm install -g pnpm
   pnpm install
   pnpm run seed    # (Only run once in backend folder)
   pnpm run dev
   ```
6. Open `http://localhost:3000` in your browser.

---

## 🌍 Deployment Guide

This project is a monorepo configured for seamless deployment to Vercel (Frontend) and Railway/Render (Backend).

### 1. Database (Supabase)
- Use your existing Supabase project. No special deployment needed.

### 2. Backend (Railway)
1. Push this entire repository to GitHub.
2. Go to [Railway.app](https://railway.app) and create a New Project from your GitHub Repo.
3. During setup, set the **Root Directory** to `/backend`.
4. Add the following Environment Variables in Railway:
   - `DATABASE_URL` = your Supabase connection string
   - `PORT` = `4000`
   - `CORS_ORIGIN` = `https://your-vercel-frontend-url.vercel.app` (Add this after deploying frontend)
   - `ROOM_TTL_HOURS` = `6`
   - `MAX_PARTICIPANTS` = `50`
   - `MAX_QUEUE_SIZE` = `20`
5. Deploy! Railway will automatically detect the pnpm workspace, install dependencies, and run `npm start` which points to the compiled `dist/index.js`.

### 3. Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and import your GitHub repository.
2. Under "Framework Preset", select **Next.js**.
3. Under "Root Directory", select `frontend`.
4. Add the following Environment Variables in Vercel:
   - `NEXT_PUBLIC_SOCKET_URL` = `https://your-railway-backend-url.up.railway.app`
   - `NEXT_PUBLIC_API_URL` = `https://your-railway-backend-url.up.railway.app/api`
   - `NEXT_PUBLIC_APP_URL` = `https://your-vercel-frontend-url.vercel.app`
5. Click **Deploy**. Vercel natively supports pnpm workspaces and will handle the build automatically.

> **Important**: Once the backend is deployed, grab the backend URL and update the frontend environment variables. Once the frontend is deployed, grab the frontend URL and update the `CORS_ORIGIN` on the backend!

---

## 🛠 Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Zustand, Lucide React, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, `pg` (Postgres driver).
- **Shared**: Monorepo using `pnpm` workspaces for shared TypeScript types.
