# MediFind Database Documentation

MediFind uses a relational schema stored in PostgreSQL (or auto-initialized SQLite fallback via `database/schema.sql` and `database/seed.sql`).

## Table Definitions

### 1. `medicines`
Stores catalog information for available medicines.
- `id` (INTEGER PRIMARY KEY)
- `name` (VARCHAR) — Brand/Commercial name (e.g. "Crocin 650")
- `generic_name` (VARCHAR) — Active pharmaceutical ingredient (e.g. "Paracetamol")
- `brand_name` (VARCHAR) — Manufacturer brand (e.g. "Crocin")
- `strength` (VARCHAR) — Dosage amount (e.g. "650 mg")
- `form` (VARCHAR) — Preparation type ("Tablet", "Capsule", "Syrup", "Injection")
- `description` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

### 2. `pharmacies`
Stores registered pharmacy details centered in **Bhopal, Madhya Pradesh**.
- `id` (INTEGER PRIMARY KEY)
- `name` (VARCHAR) — Pharmacy business name
- `address` (TEXT) — Street address
- `city` (VARCHAR, default 'Bhopal')
- `state` (VARCHAR, default 'Madhya Pradesh')
- `postal_code` (VARCHAR)
- `latitude` (REAL) — WGS84 decimal latitude
- `longitude` (REAL) — WGS84 decimal longitude
- `is_open` (BOOLEAN, default 1) — Open status
- `phone` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### 3. `inventory`
Junction table tracking stock quantity and unit price for a medicine at a specific pharmacy.
- `id` (INTEGER PRIMARY KEY)
- `medicine_id` (FOREIGN KEY -> `medicines.id`)
- `pharmacy_id` (FOREIGN KEY -> `pharmacies.id`)
- `quantity` (INTEGER DEFAULT 0 CHECK quantity >= 0)
- `price` (REAL DEFAULT 0.0 CHECK price >= 0)
- `availability` (VARCHAR) — Calculated stock status (`available`, `low_stock`, `out_of_stock`)
- `created_at`, `updated_at` (TIMESTAMP)

### 4. `reservations`
Stores user prototype reservation requests.
- `id` (INTEGER PRIMARY KEY)
- `medicine_id` (FOREIGN KEY -> `medicines.id`)
- `pharmacy_id` (FOREIGN KEY -> `pharmacies.id`)
- `quantity` (INTEGER CHECK quantity > 0)
- `status` (VARCHAR) — `pending`, `accepted`, `cancelled`
- `customer_name` (VARCHAR)
- `customer_phone` (VARCHAR)
- `notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

---

## Stock Status Calculation Logic

Stock status is computed strictly in the backend/database service whenever quantity is retrieved or updated:

```text
IF quantity > 10 THEN
   availability = 'available'    (Label: "Available", Visual: Emerald Green)
ELSE IF quantity >= 1 AND quantity <= 10 THEN
   availability = 'low_stock'    (Label: "Low Stock", Visual: Amber Yellow)
ELSE IF quantity = 0 THEN
   availability = 'out_of_stock' (Label: "Out of Stock", Visual: Rose Red)
END IF
```
