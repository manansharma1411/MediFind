require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`MediFind Backend API Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
