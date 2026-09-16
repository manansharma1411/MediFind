# MediFind API Documentation

The MediFind Backend REST API provides endpoints for searching medicines, querying pharmacy availability, updating inventory records (Admin), and submitting reservation requests.

Base URL: `http://localhost:5000/api`

---

## 1. Medicines Endpoints

### 1.1 Search Medicines
- **GET** `/api/medicines?q={query}`
- **Query Parameters**:
  - `q` *(optional)*: Partial search string for medicine name, generic name, or brand name.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "query": "Crocin",
  "count": 1,
  "data": [
    {
      "id": 1,
      "name": "Crocin 650",
      "generic_name": "Paracetamol",
      "brand_name": "Crocin",
      "strength": "650 mg",
      "form": "Tablet",
      "description": "Fast-acting fever reducer and mild-to-moderate pain reliever."
    }
  ],
  "didYouMean": null
}
```
- **Typo Suggestion Example (`?q=Crocinnn`)**:
```json
{
  "success": true,
  "query": "Crocinnn",
  "count": 0,
  "data": [],
  "didYouMean": "Crocin"
}
```

### 1.2 Get Medicine Details
- **GET** `/api/medicines/:id`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Crocin 650",
    "generic_name": "Paracetamol",
    "brand_name": "Crocin",
    "strength": "650 mg",
    "form": "Tablet"
  }
}
```

### 1.3 Get Pharmacy Availability for Medicine
- **GET** `/api/medicines/:id/availability?lat={lat}&lng={lng}`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "medicine": { "id": 1, "name": "Crocin 650" },
  "count": 4,
  "data": [
    {
      "inventory_id": 1,
      "pharmacy_id": 1,
      "pharmacy_name": "Apollo Pharmacy - MP Nagar",
      "address": "Plot 12, Zone I, Maharana Pratap Nagar, Bhopal, Madhya Pradesh 462011",
      "phone": "+91 755 2551234",
      "price": 32.5,
      "quantity": 25,
      "availability": "available",
      "is_open": true,
      "latitude": 23.2332,
      "longitude": 77.4343,
      "distance_km": 3.7
    }
  ]
}
```

---

## 2. Pharmacies Endpoints

### 2.1 Get All Pharmacies
- **GET** `/api/pharmacies`
- **Success Response (200 OK)**: Returns array of pharmacies in Bhopal with geographic coordinates and open/closed status.

### 2.2 Get Pharmacy Details & Inventory
- **GET** `/api/pharmacies/:id`

---

## 3. Inventory Endpoints (Admin)

### 3.1 Get All Inventory Records
- **GET** `/api/inventory`

### 3.2 Update Inventory Quantity & Price
- **PUT** `/api/inventory/:id` (or `/api/admin/inventory/:id`)
- **Request Body**:
```json
{
  "quantity": 0,
  "price": 30.00
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Inventory successfully updated for Crocin 650 at Sharma Medicos - Arera Colony.",
  "data": {
    "inventory_id": 2,
    "quantity": 0,
    "price": 30.00,
    "availability": "out_of_stock",
    "updated_at": "2026-09-16T14:01:53.021Z"
  }
}
```

---

## 4. Reservations Endpoints

### 4.1 Create Demonstration Reservation
- **POST** `/api/reservations`
- **Request Body**:
```json
{
  "medicine_id": 1,
  "pharmacy_id": 1,
  "quantity": 2,
  "customer_name": "Dr. Anita Roy",
  "customer_phone": "+91 99887 76655",
  "notes": "Will pick up by 5 PM"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Reservation request successfully submitted and recorded.",
  "data": {
    "reservation_id": 1,
    "status": "pending",
    "unit_price": 32.5,
    "total_estimated_price": 65.00
  }
}
```
