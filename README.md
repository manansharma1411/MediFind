# MediFind — Medicine Availability Finder

> **Find Your Medicine. Find It Nearby.**

MediFind is a full-stack, database-backed medicine discovery platform built with **React 18, Vite, Node.js, Express, PostgreSQL, and React Leaflet**. It enables users to search for medicines, compare real-time availability and prices across pharmacies in **Bhopal, Madhya Pradesh**, view interactive map locations with stock status pins, and submit medicine reservations.

---

## ✨ Key Features

- **🔍 Smart Medicine Search**: Case-insensitive partial matching across brand, generic, and medicine names, with Levenshtein-based fuzzy *"Did You Mean?"* typo suggestions.
- **📍 Pharmacy Stock Availability**: Real-time pharmacy stock counts, prices, open/closed indicators, and Haversine distance in km centered in Bhopal.
- **🗺️ Interactive Leaflet Map**: OpenStreetMap tile layer with custom SVG markers color-coded by database stock status:
  - 🟢 **Green**: Available (`quantity > 10`)
  - 🟡 **Yellow**: Low Stock (`1 <= quantity <= 10`)
  - 🔴 **Red**: Out of Stock (`quantity = 0`)
- **🛍️ Reservation & Stock Safety**: Submit medicine reservation requests with instant price calculations. Admin acceptance automatically deducts stock from inventory and updates availability.
- **🔐 Admin Portal & Authentication**: Secure JWT-authenticated Admin Dashboard (`/login` & `/admin`) with analytics summary cards, inventory quantity/price editing, and reservation fulfillment controls.
- **☁️ Vercel & PostgreSQL Ready**: Configured for single-project deployment on Vercel with Vercel Serverless Functions (`api/index.js`) and hosted PostgreSQL (Neon / Supabase / Vercel Postgres).

---

## 🔐 Demo Credentials

- **Admin Login Page**: `/login`
- **Email**: `admin@medifind.com`
- **Password**: `admin123`

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm

### 1. Installation & Seeding
```bash
# Clone the repository
git clone https://github.com/manansharma1411/MediFind.git
cd MediFind

# Install dependencies and seed database
npm run seed
```

### 2. Run Local Development (Concurrent Backend & Frontend)
```bash
# Terminal 1: Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Frontend App (Port 3000)
npm run dev:frontend
```
*Open `http://localhost:3000` in your browser.*

---

## 📚 Technical Documentation

Explore the `docs/` folder for detailed guides:
- [API Reference](docs/API.md)
- [Database Schema & Constraints](docs/DATABASE.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Vercel Deployment Guide](docs/DEPLOYMENT.md)
- [Presentation Demo Walkthrough](docs/DEMO_FLOW.md)
- [Troubleshooting & FAQ](docs/TROUBLESHOOTING.md)

---

## ⚕️ Medical Disclaimer
*MediFind is an availability discovery platform prototype for university exhibition demonstration. It does not provide medical diagnosis, treatment, or prescribing advice.*
