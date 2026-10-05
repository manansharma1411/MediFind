# MediFind API Documentation

The MediFind REST API provides endpoints for medicine search, pharmacy availability discovery, user reservation requests, admin authentication, analytics, and inventory management.

Base URL: `/api` (or `http://localhost:5000/api` during local development)

---

## 1. System & Authentication Endpoints

### 1.1 Health Check
- **GET** `/api/health`
- **Access**: Public
- **Response**:
```json
{
  "status": "ok",
  "message": "MediFind API Server is running smoothly.",
  "environment": "production",
  "timestamp": "2026-10-05T14:20:00.000Z"
}
```

### 1.2 Admin Login
- **POST** `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@medifind.com",
  "password": "admin123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@medifind.com",
    "role": "admin"
  }
}
```

### 1.3 Verify Profile Token
- **GET** `/api/auth/me`
- **Access**: Protected (`Authorization: Bearer <token>`)

---

## 2. Public Medicine & Pharmacy Endpoints

### 2.1 Search Medicines
- **GET** `/api/medicines?q={query}`
- **Query Params**: `q` *(optional search string)*
- **Response**: Returns matching medicine records + Levenshtein typo suggestion (`didYouMean`) if applicable.

### 2.2 Medicine Availability
- **GET** `/api/medicines/:id/availability?lat={lat}&lng={lng}`
- **Response**: Returns pharmacy stock counts, prices, availability status, and Haversine distance in km.

### 2.3 Pharmacy Details & Catalog
- **GET** `/api/pharmacies/:id`
- **Response**: Returns pharmacy profile, address, phone, GPS coordinates, and full medicine inventory.

---

## 3. Reservation Endpoints

### 3.1 Create Reservation Request
- **POST** `/api/reservations`
- **Request Body**:
```json
{
  "medicine_id": 1,
  "pharmacy_id": 1,
  "quantity": 2,
  "customer_name": "Dr. Anita Roy",
  "customer_phone": "+91 98260 12345",
  "notes": "Will pick up by 5 PM"
}
```

### 3.2 Get Reservation Receipt Details
- **GET** `/api/reservations/:id`
- **Access**: Public

---

## 4. Protected Admin Endpoints

### 4.1 Admin Analytics Stats
- **GET** `/api/admin/stats`
- **Access**: Protected (`Authorization: Bearer <token>`)

### 4.2 Update Inventory Stock & Price
- **PUT** `/api/admin/inventory/:id`
- **Access**: Protected (`Authorization: Bearer <token>`)
- **Request Body**: `{ "quantity": 0, "price": 30.00 }`

### 4.3 Update Reservation Status & Stock Deduction
- **PUT** `/api/reservations/:id/status`
- **Access**: Protected (`Authorization: Bearer <token>`)
- **Request Body**: `{ "status": "accepted" }`
- **Note**: Accepting a reservation transactionally deducts stock from inventory and updates stock status in database.
