# MediFind System Architecture

## Architecture Overview

MediFind is structured as a **cohesive full-stack monolithic application** designed for single-developer maintainability, high performance, and zero-headache deployment on **Vercel**.

```text
+-----------------------------------------------------------------------+
|                            USER INTERFACE                             |
|               Vite 5 + React 18 + Tailwind CSS 3                      |
|      React Leaflet (OpenStreetMap) • Axios HTTP • Lucide Icons       |
+-----------------------------------------------------------------------+
                                   │
                           Relative API Requests (/api/*)
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                    VERCEL SERVERLESS FUNCTION LAYER                   |
|                        api/index.js (Express)                         |
|  - JWT Authentication & Bcrypt Password Verification                  |
|  - Medicine & Fuzzy Search Engine (Levenshtein Distance)              |
|  - Stock Status Calculation Engine                                    |
|  - Haversine Distance Calculator (Bhopal Coordinates)                 |
|  - Transactional Reservation Fulfillments & Stock Deductions          |
+-----------------------------------------------------------------------+
                                   │
                           Database Connections
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                          DATABASE LAYER                               |
|        PostgreSQL (Primary) / WASM SQLite File Database (Fallback)    |
|       Source of Truth for Inventory Quantities & Availability         |
+-----------------------------------------------------------------------+
```

## Vercel Serverless Function Design
- **Single Handler Routing**: `vercel.json` rewrites all `/api/(.*)` HTTP requests to `api/index.js`.
- **Stateless & Database-Backed**: Serverless functions do not rely on local filesystem state; PostgreSQL (`DATABASE_URL`) acts as the single persistent source of truth.
- **Local Development Dual Mode**: During local development (`npm run dev`), Express runs on port 5000 and Vite proxies `/api` requests seamlessly.

## Transactional Reservation Fulfillment & Stock Logic
1. **User Reservation Request**: `POST /api/reservations` validates requested quantity <= available stock and creates a `pending` reservation.
2. **Admin Review & Acceptance**: Admin clicks **Accept** on `/api/reservations/:id/status`.
3. **Database Transaction**:
   - Checks current inventory stock (`inventory.quantity`).
   - Deducts requested quantity (`newQty = inventory.quantity - reservation.quantity`).
   - Recalculates stock status (`calculateStockStatus(newQty)` → `available`, `low_stock`, or `out_of_stock`).
   - Updates `inventory` table in PostgreSQL.
   - Updates reservation status to `accepted`.
