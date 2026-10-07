const app = require('../src/app');
const { initDatabase } = require('../src/config/db');

let dbPromise = null;

module.exports = async (req, res) => {
  if (!dbPromise) {
    dbPromise = initDatabase();
  }
  await dbPromise;
  return app(req, res);
};
