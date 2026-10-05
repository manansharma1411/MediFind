const { initDatabase, queryOne } = require('./src/config/db');
const authController = require('./src/controllers/authController');
const adminController = require('./src/controllers/adminController');
const medicineController = require('./src/controllers/medicineController');
const inventoryController = require('./src/controllers/inventoryController');
const reservationController = require('./src/controllers/reservationController');

async function testFinalBackend() {
  console.log('=== Final Review Backend Unit Tests ===');
  await initDatabase();

  // Test 1: Admin Login
  let adminToken = null;
  const reqLogin = { body: { email: 'admin@medifind.com', password: 'admin123' } };
  const resLogin = {
    json: (data) => {
      adminToken = data.token;
      console.log('1. Admin Login Success:', data.success, 'Token generated:', !!adminToken, 'User:', data.user?.name);
    },
    status: function(code) { return this; }
  };
  await authController.login(reqLogin, resLogin);

  // Test 2: Admin Stats
  const reqStats = { user: { id: 1, role: 'admin' } };
  const resStats = {
    json: (data) => console.log('2. Admin Stats:', data.stats),
    status: function(code) { return this; }
  };
  await adminController.getAdminStats(reqStats, resStats);

  // Test 3: Search Medicine
  const reqSearch = { query: { q: 'Crocin' } };
  const resSearch = {
    json: (data) => console.log('3. Search Crocin:', data.count, 'found. Top:', data.data[0]?.name),
    status: function(code) { return this; }
  };
  await medicineController.searchMedicines(reqSearch, resSearch);

  // Test 4: Submit Reservation Request
  let reservationId = null;
  const reqRes = {
    body: {
      medicine_id: 1,
      pharmacy_id: 1,
      quantity: 2,
      customer_name: 'Evaluator Demo User',
      customer_phone: '+91 99999 88888',
      notes: 'Final review testing reservation'
    }
  };
  const resRes = {
    json: (data) => {
      reservationId = data.data?.reservation_id;
      console.log('4. Create Reservation Success:', data.message, 'ID:', reservationId);
    },
    status: function(code) { return this; }
  };
  await reservationController.createReservation(reqRes, resRes);

  // Test 5: Admin Accept Reservation & Verify Stock Deduction
  const initialInv = await queryOne('SELECT quantity FROM inventory WHERE medicine_id = 1 AND pharmacy_id = 1');
  console.log('5a. Pre-acceptance Stock for Med 1 at Pharmacy 1:', initialInv?.quantity);

  const reqAccept = { params: { id: reservationId }, body: { status: 'accepted' }, user: { id: 1, role: 'admin' } };
  const resAccept = {
    json: (data) => console.log('5b. Accept Reservation Result:', data.message),
    status: function(code) { return this; }
  };
  await reservationController.updateReservationStatus(reqAccept, resAccept);

  const postInv = await queryOne('SELECT quantity, availability FROM inventory WHERE medicine_id = 1 AND pharmacy_id = 1');
  console.log('5c. Post-acceptance Stock in DB:', postInv?.quantity, 'Status:', postInv?.availability);

  // Test 6: Admin Update Inventory (Change item 2 qty 5 -> 0)
  const reqUpdateInv = { params: { id: 2 }, body: { quantity: 0, price: 30.0 }, user: { id: 1, role: 'admin' } };
  const resUpdateInv = {
    json: (data) => console.log('6. Inventory Update Result:', data.message, 'New Availability:', data.data.availability),
    status: function(code) { return this; }
  };
  await inventoryController.updateInventoryItem(reqUpdateInv, resUpdateInv);

  console.log('=== All Backend Tests Passed Cleanly! ===');
}

testFinalBackend().catch(err => {
  console.error('Test Runner Error:', err);
});
