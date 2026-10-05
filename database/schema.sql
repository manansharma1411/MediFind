-- MediFind Database Schema (PostgreSQL & SQLite compatible)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  strength VARCHAR(100) NOT NULL,
  form VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pharmacies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Bhopal',
  state VARCHAR(100) NOT NULL DEFAULT 'Madhya Pradesh',
  postal_code VARCHAR(20) NOT NULL DEFAULT '462001',
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT 1,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  price REAL NOT NULL DEFAULT 0.0 CHECK (price >= 0),
  availability VARCHAR(50) NOT NULL DEFAULT 'out_of_stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(medicine_id, pharmacy_id)
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id INTEGER NOT NULL REFERENCES medicines(id),
  pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast searching & foreign key lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_generic ON medicines(generic_name);
CREATE INDEX IF NOT EXISTS idx_medicines_brand ON medicines(brand_name);
CREATE INDEX IF NOT EXISTS idx_inventory_medicine ON inventory(medicine_id);
CREATE INDEX IF NOT EXISTS idx_inventory_pharmacy ON inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
