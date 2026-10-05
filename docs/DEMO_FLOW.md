# MediFind — Final Presentation Demonstration Flow

Follow these exact steps during your final university review presentation to demonstrate all core functionality, database persistence, interactive map visualization, and admin reservation management.

---

## Step 1: Open the MediFind Web Application
1. Navigate to the live application URL (or local `http://localhost:3000`).
2. Observe the clean visual hierarchy, Bhopal location indicator, and search bar.

---

## Step 2: Search for a Medicine & Test Fuzzy Typo Tolerance
1. Type **"Crocin"** into the search bar -> press Enter.
2. View matching medicine card displaying brand name (`Crocin`), generic name (`Paracetamol`), dosage (`650 mg`), and form (`Tablet`).
3. **Demonstrate Typo Tolerance**: Type **"Crocinnn"** into the search bar.
4. Point out the **"Did you mean Crocin?"** suggestion banner -> click **Apply Suggestion**.

---

## Step 3: Compare Pharmacy Availability & Map Visualizations
1. Click **View Pharmacy Availability** on Crocin 650.
2. Review the list of Bhopal pharmacies:
   - **Apollo Pharmacy (MP Nagar)**: Price ₹32.50 | Qty 25 (🟢 **Available**)
   - **Sharma Medicos (Arera Colony)**: Price ₹30.00 | Qty 5 (🟡 **Low Stock**)
   - **Sanjivani Medical Store (New Market)**: Price ₹29.00 | Qty 0 (🔴 **Out of Stock**)
3. Inspect the **React Leaflet Map** on the right side.
4. Click on the Green, Yellow, and Red pins to open popups with prices, stock status, and direct Google Maps route buttons.
5. Switch to **Table View** to compare price, stock, and distance in a structured comparison table.

---

## Step 4: Submit a User Medicine Reservation
1. Click **Reserve** on **Apollo Pharmacy - MP Nagar**.
2. Set quantity to `2` -> enter Customer Name (`Dr. Anita Roy`) and Phone (`+91 98260 12345`).
3. Click **Confirm Reservation**.
4. View the confirmation dialog displaying unique reservation ID `#RES-6` and estimated cost `₹65.00`.

---

## Step 5: Admin Login & Analytics Overview
1. Click **Admin Login** in the top navigation bar.
2. Enter demo credentials:
   - **Email**: `admin@medifind.com`
   - **Password**: `admin123`
3. Click **Sign In as Admin**.
4. Inspect the Admin Analytics Dashboard overview cards (Total Medicines: 6, Total Pharmacies: 4, Low Stock Count, Out of Stock Count).

---

## Step 6: Admin Reservation Acceptance & Stock Deduction (Core Feature)
1. Switch to the **Reservations** tab in the Admin Dashboard.
2. Locate the pending reservation request `#RES-6` for **Crocin 650** (Qty 2) at Apollo Pharmacy.
3. Click **Accept**.
4. Point out that the backend transactionally **deducted 2 units from Apollo Pharmacy's database inventory** (stock reduced from 25 to 23 units).

---

## Step 7: Admin Stock Update & Live User View Re-fetch (Core Feature)
1. Switch to the **Inventory Management** tab.
2. Locate **Sharma Medicos - Crocin 650** (currently Qty `5`, Low Stock).
3. Click **Edit Stock** -> change Quantity from `5` to `0` -> click **Save to DB**.
4. Receive the green confirmation alert indicating database persistence.
5. Click **Verify User View** (or return to `/medicines/1`) and click **Refresh DB Availability**.
6. **Observe that Sharma Medicos now displays "Out of Stock" (Red Badge & Red Map Pin) strictly based on the updated database quantity!**
