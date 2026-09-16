# MediFind System Architecture

## Architecture Overview

MediFind is designed as a **cohesive full-stack monolithic prototype** optimized for single-developer development, testing, and university exhibition demonstration.

```text
+-----------------------------------------------------------------------+
|                            USER INTERFACE                             |
|               Vite 5 + React 18 + Tailwind CSS 3                      |
|      React Leaflet (OpenStreetMap) • Axios HTTP • Lucide Icons       |
+-----------------------------------------------------------------------+
                                   │
                           REST API Calls
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                            BACKEND SERVER                             |
|                       Node.js + Express REST API                      |
|  - Medicine & Fuzzy Search Engine (Levenshtein Distance)              |
|  - Stock Status Calculation Engine                                    |
|  - Distance Calculation (Haversine Formula for Bhopal Coordinates)   |
+-----------------------------------------------------------------------+
                                   │
                             Database Query
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                          DATABASE LAYER                               |
|        PostgreSQL (Primary) / WASM SQLite File Database (Fallback)    |
|       Source of Truth for Inventory Quantities & Availability         |
+-----------------------------------------------------------------------+
```

## Why a Monolithic Architecture was Selected
1. **Single-Developer Efficiency**: Eliminates cross-repository overhead, service discovery complexities, and inter-service authentication boilerplate.
2. **Exhibition Demonstration Speed**: Allows instant local setup (`npm start` in backend and `npm run dev` in frontend) with 100% offline demonstration reliability.
3. **Database Integrity**: PostgreSQL / SQLite acts as the single source of truth for stock quantities and availability recalculation.

## Data Flow for Admin Inventory Update
1. Admin navigates to `/admin` and changes item quantity from 5 to 0.
2. Admin clicks "Save to DB", triggering `PUT /api/inventory/:id`.
3. Express server calculates `calculateStockStatus(0)` -> returns `'out_of_stock'`.
4. SQL `UPDATE inventory SET quantity = 0, availability = 'out_of_stock' WHERE id = :id` is executed and saved to database disk.
5. User returns to medicine availability view `/medicines/:id` and re-fetches data.
6. Updated stock status badge ("Out of Stock") and red map pin are displayed immediately from the database response.
