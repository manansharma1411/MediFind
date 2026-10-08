-- MediFind Seed Data (Bhopal, Madhya Pradesh, India Demonstration Data)

DELETE FROM reservations;
DELETE FROM inventory;
DELETE FROM pharmacies;
DELETE FROM medicines;
DELETE FROM users;

-- Seed Admin User (Password: admin123)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'System Administrator', 'admin@medifind.com', '$2a$10$Zt0w3Xh9d1W0k.m8J1h6O.4Jq6zZ9l3v8k1m5n7p9q1r3s5t7u9v1', 'admin');

INSERT INTO medicines (id, name, generic_name, brand_name, strength, form, description) VALUES
(1, 'Crocin 650', 'Paracetamol', 'Crocin', '650 mg', 'Tablet', 'Fast-acting fever reducer and mild-to-moderate pain reliever.'),
(2, 'Mox 500', 'Amoxicillin', 'Mox', '500 mg', 'Capsule', 'Broad-spectrum penicillin antibiotic for bacterial infections.'),
(3, 'Glycomet 500', 'Metformin HCl', 'Glycomet', '500 mg', 'Tablet', 'First-line medication for the treatment of type 2 diabetes.'),
(4, 'Cetzine 10', 'Cetirizine Dihydrochloride', 'Cetzine', '10 mg', 'Tablet', 'Non-drowsy antihistamine for allergic rhinitis and hives.'),
(5, 'Azithral 500', 'Azithromycin', 'Azithral', '500 mg', 'Tablet', 'Macrolide antibiotic used for respiratory and skin infections.'),
(6, 'Allegra 120', 'Fexofenadine Hydrochloride', 'Allegra', '120 mg', 'Tablet', 'Second-generation antihistamine for seasonal allergy symptoms.');

INSERT INTO pharmacies (id, name, address, city, state, postal_code, latitude, longitude, is_open, phone) VALUES
(1, 'Apollo Pharmacy - MP Nagar', 'Plot 12, Zone I, Maharana Pratap Nagar', 'Bhopal', 'Madhya Pradesh', '462011', 23.2332, 77.4343, TRUE, '+91 755 2551234'),
(2, 'Sharma Medicos - Arera Colony', 'E-5/112, Arera Colony, Near Bittan Market', 'Bhopal', 'Madhya Pradesh', '462016', 23.2156, 77.4305, TRUE, '+91 755 2778899'),
(3, 'Sanjivani Medical Store - New Market', 'Shop 45, TT Nagar, Main New Market', 'Bhopal', 'Madhya Pradesh', '462003', 23.2376, 77.4010, TRUE, '+91 755 2559988'),
(4, 'Care & Cure Pharmacy - Kolar Road', 'Main Road, Kolar Road, Near Bairagarh Chichali', 'Bhopal', 'Madhya Pradesh', '462042', 23.1890, 77.4190, FALSE, '+91 755 2894455');

INSERT INTO inventory (id, medicine_id, pharmacy_id, quantity, price, availability) VALUES
(1, 1, 1, 25, 32.50, 'available'),
(2, 1, 2, 5, 30.00, 'low_stock'),
(3, 1, 3, 0, 29.00, 'out_of_stock'),
(4, 1, 4, 15, 31.00, 'available'),

(5, 2, 1, 12, 85.00, 'available'),
(6, 2, 2, 4, 82.00, 'low_stock'),
(7, 2, 3, 18, 80.00, 'available'),

(8, 3, 1, 50, 45.00, 'available'),
(9, 3, 2, 0, 42.00, 'out_of_stock'),

(10, 4, 3, 8, 18.50, 'low_stock'),
(11, 4, 1, 30, 20.00, 'available'),

(12, 5, 1, 6, 115.00, 'low_stock'),
(13, 5, 4, 20, 110.00, 'available');

INSERT INTO reservations (id, medicine_id, pharmacy_id, quantity, status, customer_name, customer_phone, notes) VALUES
(1, 1, 1, 2, 'pending', 'Rahul Sharma', '+91 98260 12345', 'Will pick up by 5 PM today.');
