# MediFind — Medicine Availability Finder

> **Find Your Medicine. Find It Nearby.**

MediFind is a full-stack, database-backed web application designed to help users search for medicines, compare real-time availability and prices across pharmacies, view interactive map locations with stock status pins, and place medicine reservation requests.

---

## ✨ Features

- **🔍 Smart Medicine Search**: Search by medicine name, generic name, or brand name with case-insensitivity, partial matching, and fuzzy "Did You Mean?" typo suggestions.
- **📍 Real-Time Pharmacy Availability**: View pharmacy stock counts, unit prices, open/closed statuses, and distance in kilometers centered around **Bhopal, Madhya Pradesh**.
- **🗺️ Interactive Leaflet Map**: OpenStreetMap integration displaying pharmacy markers color-coded by live database stock:
  - 🟢 **Green**: Available (`quantity > 10`)
  - 🟡 **Yellow**: Low Stock (`1 <= quantity <= 10`)
  - 🔴 **Red**: Out of Stock (`quantity = 0`)
- **🛍️ Reservation Flow**: Place reservation requests with custom quantity, customer details, and instant cost calculations.
- **⚙️ Admin Inventory Management**: Manage stock quantities and prices in real-time. Database updates automatically recalculate stock status and reflect across user search and map views.
- **💾 Dual Database Engine**: Supports PostgreSQL or zero-config WASM SQLite with auto-initialization from relational `schema.sql` and `seed.sql`.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Lucide Icons, React Leaflet, OpenStreetMap, Axios, React Router DOM 6
- **Backend**: Node.js, Express, REST APIs, SQL.js (WASM SQLite) / PostgreSQL (`pg`)
- **Database**: Relational SQL Schema (`database/schema.sql`) and Bhopal Seed Data (`database/seed.sql`)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm

### 1. Clone & Setup
```bash
git clone <your-repository-url>
cd medifind
```

### 2. Start Backend API Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 3. Start Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 📚 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/db.js          # Unified DB driver (PostgreSQL / WASM SQLite)
│   │   ├── controllers/          # Search, Pharmacy, Inventory, Reservation logic
│   │   ├── routes/               # Express API endpoints
│   │   ├── utils/                # Stock status engine, Haversine distance, Levenshtein search
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, SearchBar, PharmacyMap, ReservationModal, StockBadge
│   │   ├── pages/                # HomePage, MedicineDetailsPage, AdminDashboardPage
│   │   ├── services/api.js       # Axios HTTP service
│   │   └── App.jsx
│   └── package.json
├── database/
│   ├── schema.sql                # Relational DB schema
│   └── seed.sql                  # Bhopal demonstration seed data
├── docs/                         # Technical documentation (API, DB, Architecture, Integration)
└── README.md
```

---

## 📝 Documentation
For detailed technical guides, explore the `docs/` folder:
- [API Reference](docs/API.md)
- [Database Schema & Stock Rules](docs/DATABASE.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Integration Guide](docs/INTEGRATION.md)
