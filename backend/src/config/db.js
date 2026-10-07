const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let isPg = false;
let pgPool = null;
let sqlDb = null;
let useMemoryFallback = false;

// Pre-computed hash for admin123
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);

// In-Memory Fail-Safe Dataset
const memMedicines = [
  { id: 1, name: 'Crocin 650', generic_name: 'Paracetamol', brand_name: 'Crocin', strength: '650 mg', form: 'Tablet', description: 'Fast-acting fever reducer and mild-to-moderate pain reliever.' },
  { id: 2, name: 'Mox 500', generic_name: 'Amoxicillin', brand_name: 'Mox', strength: '500 mg', form: 'Capsule', description: 'Broad-spectrum penicillin antibiotic for bacterial infections.' },
  { id: 3, name: 'Glycomet 500', generic_name: 'Metformin HCl', brand_name: 'Glycomet', strength: '500 mg', form: 'Tablet', description: 'First-line medication for the treatment of type 2 diabetes.' },
  { id: 4, name: 'Cetzine 10', generic_name: 'Cetirizine Dihydrochloride', brand_name: 'Cetzine', strength: '10 mg', form: 'Tablet', description: 'Non-drowsy antihistamine for allergic rhinitis and hives.' },
  { id: 5, name: 'Azithral 500', generic_name: 'Azithromycin', brand_name: 'Azithral', strength: '500 mg', form: 'Tablet', description: 'Macrolide antibiotic used for respiratory and skin infections.' },
  { id: 6, name: 'Allegra 120', generic_name: 'Fexofenadine Hydrochloride', brand_name: 'Allegra', strength: '120 mg', form: 'Tablet', description: 'Second-generation antihistamine for seasonal allergy symptoms.' }
];

const memPharmacies = [
  { id: 1, name: 'Apollo Pharmacy - MP Nagar', address: 'Plot 12, Zone I, Maharana Pratap Nagar', city: 'Bhopal', state: 'Madhya Pradesh', postal_code: '462011', latitude: 23.2332, longitude: 77.4343, is_open: 1, phone: '+91 755 2551234' },
  { id: 2, name: 'Sharma Medicos - Arera Colony', address: 'E-5/112, Arera Colony, Near Bittan Market', city: 'Bhopal', state: 'Madhya Pradesh', postal_code: '462016', latitude: 23.2156, longitude: 77.4305, is_open: 1, phone: '+91 755 2778899' },
  { id: 3, name: 'Sanjivani Medical Store - New Market', address: 'Shop 45, TT Nagar, Main New Market', city: 'Bhopal', state: 'Madhya Pradesh', postal_code: '462003', latitude: 23.2376, longitude: 77.4010, is_open: 1, phone: '+91 755 2559988' },
  { id: 4, name: 'Care & Cure Pharmacy - Kolar Road', address: 'Main Road, Kolar Road, Near Bairagarh Chichali', city: 'Bhopal', state: 'Madhya Pradesh', postal_code: '462042', latitude: 23.1890, longitude: 77.4190, is_open: 0, phone: '+91 755 2894455' }
];

const memInventory = [
  { id: 1, medicine_id: 1, pharmacy_id: 1, quantity: 25, price: 32.50, availability: 'available' },
  { id: 2, medicine_id: 1, pharmacy_id: 2, quantity: 5, price: 30.00, availability: 'low_stock' },
  { id: 3, medicine_id: 1, pharmacy_id: 3, quantity: 0, price: 29.00, availability: 'out_of_stock' },
  { id: 4, medicine_id: 1, pharmacy_id: 4, quantity: 15, price: 31.00, availability: 'available' },
  { id: 5, medicine_id: 2, pharmacy_id: 1, quantity: 12, price: 85.00, availability: 'available' },
  { id: 6, medicine_id: 2, pharmacy_id: 2, quantity: 4, price: 82.00, availability: 'low_stock' },
  { id: 7, medicine_id: 2, pharmacy_id: 3, quantity: 18, price: 80.00, availability: 'available' },
  { id: 8, medicine_id: 3, pharmacy_id: 1, quantity: 50, price: 45.00, availability: 'available' },
  { id: 9, medicine_id: 3, pharmacy_id: 2, quantity: 0, price: 42.00, availability: 'out_of_stock' },
  { id: 10, medicine_id: 4, pharmacy_id: 3, quantity: 8, price: 18.50, availability: 'low_stock' },
  { id: 11, medicine_id: 4, pharmacy_id: 1, quantity: 30, price: 20.00, availability: 'available' },
  { id: 12, medicine_id: 5, pharmacy_id: 1, quantity: 6, price: 115.00, availability: 'low_stock' },
  { id: 13, medicine_id: 5, pharmacy_id: 4, quantity: 20, price: 110.00, availability: 'available' }
];

const memReservations = [
  { id: 1, medicine_id: 1, pharmacy_id: 1, quantity: 2, status: 'pending', customer_name: 'Rahul Sharma', customer_phone: '+91 98260 12345', notes: 'Will pick up by 5 PM today.', created_at: new Date().toISOString() }
];

const memUsers = [
  { id: 1, name: 'System Administrator', email: 'admin@medifind.com', password_hash: ADMIN_PASSWORD_HASH, role: 'admin' }
];

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
      
      const schemaPath = path.join(__dirname, '../../../database/schema.sql');
      const seedPath = path.join(__dirname, '../../../database/seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        try {
          const tableCheck = await pgPool.query("SELECT to_regclass('public.users') as exists");
          if (!tableCheck.rows[0]?.exists) {
            console.log('Initializing PostgreSQL schema...');
            let pgSchema = schemaSql
              .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
              .replace(/REAL/g, 'DOUBLE PRECISION');
            await pgPool.query(pgSchema);
            if (fs.existsSync(seedPath)) {
              const seedSql = fs.readFileSync(seedPath, 'utf8');
              await pgPool.query(seedSql);
            }
          }
        } catch (e) {
          console.warn('PostgreSQL table check warning:', e.message);
        }
      }
      return;
    } catch (err) {
      console.warn('PostgreSQL connection failed, falling back to in-memory dataset:', err.message);
      isPg = false;
    }
  }

  // Attempt WASM SQLite or fallback to Memory
  try {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    sqlDb = new SQL.Database();
    
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      sqlDb.exec(fs.readFileSync(schemaPath, 'utf8'));
    }
    if (fs.existsSync(seedPath)) {
      sqlDb.exec(fs.readFileSync(seedPath, 'utf8'));
    }
    // Update seeded user hash with valid bcrypt hash
    sqlDb.run("UPDATE users SET password_hash = ? WHERE email = 'admin@medifind.com'", [ADMIN_PASSWORD_HASH]);
    console.log('Initialized in-memory SQLite database.');
  } catch (e) {
    console.warn('SQLite init failed, activating in-memory fallback driver:', e.message);
    useMemoryFallback = true;
  }
}

// Unified Query Handler
async function query(sql, params = []) {
  try {
    if (isPg && pgPool) {
      let pgSql = sql;
      let paramIdx = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIdx++}`);
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    }

    if (sqlDb && !useMemoryFallback) {
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    }
  } catch (err) {
    console.warn('Database query error, using memory fallback:', err.message);
  }

  // Memory Fallback Queries
  const cleanSql = sql.trim().toLowerCase();

  if (cleanSql.includes('from medicines')) {
    if (cleanSql.includes('where id =')) {
      const id = Number(params[0]);
      return memMedicines.filter(m => m.id === id);
    }
    if (cleanSql.includes('like')) {
      const q = (params[0] || '').replace(/%/g, '').toLowerCase();
      return memMedicines.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.generic_name.toLowerCase().includes(q) || 
        m.brand_name.toLowerCase().includes(q)
      );
    }
    return memMedicines;
  }

  if (cleanSql.includes('from pharmacies')) {
    if (cleanSql.includes('where id =')) {
      const id = Number(params[0]);
      return memPharmacies.filter(p => p.id === id);
    }
    return memPharmacies;
  }

  if (cleanSql.includes('from inventory')) {
    let results = memInventory.map(inv => {
      const med = memMedicines.find(m => m.id === inv.medicine_id) || {};
      const pharm = memPharmacies.find(p => p.id === inv.pharmacy_id) || {};
      return {
        inventory_id: inv.id,
        medicine_id: inv.medicine_id,
        pharmacy_id: inv.pharmacy_id,
        quantity: inv.quantity,
        price: inv.price,
        availability: inv.availability,
        updated_at: new Date().toISOString(),
        medicine_name: med.name,
        generic_name: med.generic_name,
        brand_name: med.brand_name,
        strength: med.strength,
        form: med.form,
        pharmacy_name: pharm.name,
        address: pharm.address,
        city: pharm.city,
        state: pharm.state,
        postal_code: pharm.postal_code,
        latitude: pharm.latitude,
        longitude: pharm.longitude,
        is_open: pharm.is_open,
        phone: pharm.phone
      };
    });

    if (cleanSql.includes('where i.medicine_id =') || cleanSql.includes('where medicine_id =')) {
      const medId = Number(params[0]);
      results = results.filter(r => r.medicine_id === medId);
    }
    if (cleanSql.includes('where i.pharmacy_id =') || cleanSql.includes('where pharmacy_id =')) {
      const pharmId = Number(params[0]);
      results = results.filter(r => r.pharmacy_id === pharmId);
    }
    if (cleanSql.includes('where i.id =') || cleanSql.includes('where id =')) {
      const invId = Number(params[0]);
      results = results.filter(r => r.inventory_id === invId);
    }
    return results;
  }

  if (cleanSql.includes('from reservations')) {
    let results = memReservations.map(res => {
      const med = memMedicines.find(m => m.id === res.medicine_id) || {};
      const pharm = memPharmacies.find(p => p.id === res.pharmacy_id) || {};
      const inv = memInventory.find(i => i.medicine_id === res.medicine_id && i.pharmacy_id === res.pharmacy_id) || {};
      return {
        reservation_id: res.id,
        medicine_id: res.medicine_id,
        medicine_name: med.name,
        generic_name: med.generic_name,
        strength: med.strength,
        form: med.form,
        pharmacy_id: res.pharmacy_id,
        pharmacy_name: pharm.name,
        pharmacy_address: pharm.address,
        pharmacy_phone: pharm.phone,
        latitude: pharm.latitude,
        longitude: pharm.longitude,
        quantity: res.quantity,
        price: inv.price || 30,
        current_stock: inv.quantity || 0,
        status: res.status,
        customer_name: res.customer_name,
        customer_phone: res.customer_phone,
        notes: res.notes,
        created_at: res.created_at,
        updated_at: res.created_at
      };
    });

    if (cleanSql.includes('where r.id =') || cleanSql.includes('where id =')) {
      const id = Number(params[0]);
      results = results.filter(r => r.reservation_id === id);
    }
    return results;
  }

  if (cleanSql.includes('from users')) {
    if (cleanSql.includes('lower(email) =')) {
      const email = (params[0] || '').toLowerCase();
      return memUsers.filter(u => u.email.toLowerCase() === email);
    }
    if (cleanSql.includes('where id =')) {
      const id = Number(params[0]);
      return memUsers.filter(u => u.id === id);
    }
    return memUsers;
  }

  if (cleanSql.includes('count(*)')) {
    return [{ count: 5 }];
  }

  return [];
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  if (Array.isArray(rows)) {
    return rows[0] || null;
  }
  return rows;
}

async function execute(sql, params = []) {
  try {
    if (isPg && pgPool) {
      let pgSql = sql;
      let paramIdx = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIdx++}`);
      const res = await pgPool.query(pgSql, params);
      return { changes: res.rowCount, lastInsertRowid: res.rows[0]?.id };
    }

    if (sqlDb && !useMemoryFallback) {
      sqlDb.run(sql, params);
      let lastInsertRowid = null;
      try {
        const res = sqlDb.exec('SELECT last_insert_rowid() AS id');
        if (res.length > 0 && res[0].values.length > 0) {
          lastInsertRowid = res[0].values[0][0];
        }
      } catch (e) {}
      return { changes: 1, lastInsertRowid };
    }
  } catch (e) {
    console.warn('Execute DB error, executing memory update:', e.message);
  }

  // Memory Fallback Updates
  const cleanSql = sql.trim().toLowerCase();

  if (cleanSql.includes('update inventory')) {
    const qty = Number(params[0]);
    const avail = params[2];
    const id = Number(params[4] || params[3]);
    const item = memInventory.find(i => i.id === id);
    if (item) {
      item.quantity = qty;
      item.availability = avail;
    }
    return { changes: 1, lastInsertRowid: id };
  }

  if (cleanSql.includes('insert into reservations')) {
    const newId = memReservations.length + 1;
    memReservations.push({
      id: newId,
      medicine_id: Number(params[0]),
      pharmacy_id: Number(params[1]),
      quantity: Number(params[2]),
      status: 'pending',
      customer_name: params[3],
      customer_phone: params[4],
      notes: params[5] || '',
      created_at: new Date().toISOString()
    });
    return { changes: 1, lastInsertRowid: newId };
  }

  if (cleanSql.includes('update reservations')) {
    const status = params[0];
    const id = Number(params[2] || params[1]);
    const res = memReservations.find(r => r.id === id);
    if (res) {
      res.status = status;
    }
    return { changes: 1, lastInsertRowid: id };
  }

  return { changes: 1, lastInsertRowid: 1 };
}

module.exports = {
  initDatabase,
  query,
  queryOne,
  execute
};
