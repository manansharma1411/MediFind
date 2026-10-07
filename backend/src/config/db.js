const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let db = null;
let isPg = false;
let pgPool = null;

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dbFilePath = isVercel
  ? path.join('/tmp', 'medifind.sqlite')
  : path.join(__dirname, '../../../database/medifind.sqlite');

const schemaPath = path.join(__dirname, '../../../database/schema.sql');
const seedPath = path.join(__dirname, '../../../database/seed.sql');

async function initDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      const { Pool } = require('pg');
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      isPg = true;
      console.log('Connected to PostgreSQL database via DATABASE_URL');
      
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        try {
          const tableCheck = await pgPool.query("SELECT to_regclass('public.users') as exists");
          if (!tableCheck.rows[0].exists) {
            console.log('Initializing PostgreSQL schema...');
            let pgSchema = schemaSql
              .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
              .replace(/REAL/g, 'DOUBLE PRECISION');
            await pgPool.query(pgSchema);
            if (fs.existsSync(seedPath)) {
              const seedSql = fs.readFileSync(seedPath, 'utf8');
              await pgPool.query(seedSql);
            }
            console.log('PostgreSQL schema and seed data initialized.');
          }
        } catch (e) {
          console.warn('PostgreSQL table verification warning:', e.message);
        }
      }
      return;
    } catch (err) {
      console.warn('PostgreSQL connection failed, falling back to SQLite (WASM):', err.message);
      isPg = false;
    }
  }

  // SQLite (WASM) Fallback
  const SQL = await initSqlJs();
  const dbDir = path.dirname(dbFilePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbFilePath)) {
    const filebuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  // Check if users table exists
  let hasUsersTable = false;
  try {
    const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (res.length > 0 && res[0].values.length > 0) {
      hasUsersTable = true;
    }
  } catch (e) {
    hasUsersTable = false;
  }

  if (!hasUsersTable) {
    console.log('Initializing SQLite schema and seed data...');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schemaSql);
    }
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      db.exec(seedSql);
    }
    saveDatabaseToDisk();
    console.log('SQLite database successfully initialized and saved.');
  }
}

function saveDatabaseToDisk() {
  if (isPg || !db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err.message);
  }
}

// Unified query wrapper
async function query(sql, params = []) {
  if (isPg) {
    let pgSql = sql;
    let paramIdx = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${paramIdx++}`);
    const res = await pgPool.query(pgSql, params);
    return res.rows;
  } else {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  if (Array.isArray(rows)) {
    return rows[0] || null;
  }
  return rows;
}

async function execute(sql, params = []) {
  if (isPg) {
    let pgSql = sql;
    let paramIdx = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${paramIdx++}`);
    const res = await pgPool.query(pgSql, params);
    return { changes: res.rowCount, lastInsertRowid: res.rows[0]?.id };
  } else {
    db.run(sql, params);
    let lastInsertRowid = null;
    try {
      const res = db.exec('SELECT last_insert_rowid() AS id');
      if (res.length > 0 && res[0].values.length > 0) {
        lastInsertRowid = res[0].values[0][0];
      }
    } catch (e) {}

    saveDatabaseToDisk();
    return { changes: 1, lastInsertRowid };
  }
}

module.exports = {
  initDatabase,
  query,
  queryOne,
  execute,
  saveDatabaseToDisk
};
