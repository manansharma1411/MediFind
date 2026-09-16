# MediFind Integration & Setup Guide

This document describes how the frontend, backend, and database interact, and how to run the full application locally for demonstration.

---

## 1. Environment Configuration (`.env`)

Create `.env` files in both backend and frontend root directories if customizing URLs.

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
# Optional PostgreSQL connection string (defaults to WASM SQLite medifind.sqlite if omitted)
# DATABASE_URL=postgres://postgres:password@localhost:5432/medifind
```

### Frontend `.env`
```env
VITE_API_BASE_URL=/api
```

---

## 2. Running the Application

### Step 1: Start the Backend Server
```bash
cd backend
npm start
```
*Expected log output:*
```text
Loaded SQLite database from d:\Projects\Project Exhibition 1 -  1\database\medifind.sqlite
MediFind Backend API Server running on port 5000
Health check: http://localhost:5000/api/health
```

### Step 2: Start the Frontend Application
```bash
cd frontend
npm run dev
```
*Expected log output:*
```text
  VITE v5.4.14  ready in 250 ms

  ➜  Local:   http://localhost:3000/
```

---

## 3. Frontend-Backend Interface Contract

- **HTTP Client**: Axios instance configured in `frontend/src/services/api.js`.
- **Proxy**: Vite proxies `/api/*` to `http://localhost:5000`.
- **Response Format**: All API responses follow a consistent JSON structure:
```json
{
  "success": true,
  "message": "Optional descriptive status message",
  "data": { ... },
  "count": 10
}
```
- **Error Handling**: Non-2xx responses include `{ "success": false, "message": "Error details" }`.
