# MediFind Troubleshooting & FAQ Guide

---

## 1. Common Issues & Solutions

### Q1: Database connection fails during Vercel deployment
- **Symptom**: `500 Internal Server Error` on API endpoints or health check returns connection error.
- **Cause**: Invalid `DATABASE_URL` format or missing SSL parameters on hosted PostgreSQL.
- **Solution**: Ensure your connection string includes `?sslmode=require` (e.g. `postgres://user:pass@ep-xyz.neon.tech/medifind?sslmode=require`). Verify that `DATABASE_URL` environment variable is configured in Vercel settings.

### Q2: Admin login fails with "Invalid credentials"
- **Symptom**: Login with `admin@medifind.com` / `admin123` returns 401 error.
- **Cause**: Database was initialized without running the seeder script.
- **Solution**: Execute the database seeder CLI: `node database/seeder.js` (or run `npm run seed`).

### Q3: Leaflet map tiles fail to render or pins misaligned
- **Symptom**: Map container appears blank or marker icons fail to display.
- **Cause**: Leaflet CSS stylesheet link missing or broken SVG pin height container.
- **Solution**: Leaflet CSS is imported via CDN link in `index.html` and styled with custom SVG `divIcon` pins in `PharmacyMap.jsx`. Ensure browser has internet access to load OpenStreetMap tiles.

### Q4: Single Page Application (SPA) routes return 404 on refresh on Vercel
- **Symptom**: Refreshing `/admin` or `/medicines/1` on Vercel returns Vercel 404 error page.
- **Cause**: Vercel needs rewrite rules to route non-API paths to `/index.html`.
- **Solution**: Verify that `vercel.json` contains:
  ```json
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
  ```
