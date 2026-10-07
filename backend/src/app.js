const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Dual route binding for Vercel Serverless Function & local Express server
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/medicines', '/medicines'], medicineRoutes);
app.use(['/api/pharmacies', '/pharmacies'], pharmacyRoutes);
app.use(['/api/inventory', '/inventory'], inventoryRoutes);
app.use(['/api/reservations', '/reservations'], reservationRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediFind API Server is running smoothly.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
