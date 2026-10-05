# MediFind — Vercel Deployment Guide

This guide describes how to deploy the **MediFind** full-stack web application to **Vercel** with hosted PostgreSQL.

---

## 1. Prerequisites

1. A **Vercel** account ([vercel.com](https://vercel.com)).
2. A hosted **PostgreSQL** database instance (e.g. **Neon.tech**, **Supabase.com**, or **Vercel Postgres**).
3. The project pushed to a **GitHub** repository.

---

## 2. Database Setup (Hosted PostgreSQL)

1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy the Connection String URI (`DATABASE_URL`):
   ```text
   postgres://username:password@ep-example-123456.us-east-2.aws.neon.tech/medifind?sslmode=require
   ```
3. Initialize the production database schema and seed data:
   - Execute `database/schema.sql` in your PostgreSQL SQL Editor.
   - Execute `database/seed.sql` in your PostgreSQL SQL Editor.
   - Run seeder CLI: `DATABASE_URL="your-connection-string" node database/seeder.js`

---

## 3. Deploying to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
2. Import your GitHub repository (`manansharma1411/MediFind`).
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`

4. Add Environment Variables in Vercel:
   | Variable Name | Example Value | Purpose |
   |---|---|---|
   | `DATABASE_URL` | `postgres://user:pass@ep-xyz.neon.tech/medifind?sslmode=require` | Hosted PostgreSQL Connection |
   | `JWT_SECRET` | `medifind-production-secret-key-2026` | Token signing secret |
   | `NODE_ENV` | `production` | Production environment flag |
   | `VITE_API_BASE_URL` | `/api` | Relative API path for frontend |

5. Click **Deploy**.

---

## 4. Post-Deployment Verification

1. Open your live Vercel URL (e.g., `https://medifind.vercel.app`).
2. Test **Health Endpoint**: `https://medifind.vercel.app/api/health`.
3. Test **User Search**: Search for "Paracetamol" or "Crocin".
4. Test **Admin Login**: Sign in at `https://medifind.vercel.app/login` using `admin@medifind.com` / `admin123`.
5. Test **Live Database Persistence**: Update inventory item quantity to `0` in Admin panel and verify updated "Out of Stock" status on the user availability page.
