const app = require('../backend/src/app');
const { initDatabase } = require('../backend/src/config/db');

let dbInitialized = false;

module.exports = async (req, res) => {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
  return app(req, res);
};
