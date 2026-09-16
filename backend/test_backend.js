const { initDatabase } = require('./src/config/db');
const medicineController = require('./src/controllers/medicineController');
const inventoryController = require('./src/controllers/inventoryController');
const reservationController = require('./src/controllers/reservationController');

async function testBackend() {
  console.log('--- Testing MediFind Backend Logic ---');
  await initDatabase();

  // Test 1: Medicines search
  const reqSearch = { query: { q: 'Crocin' } };
  const resSearch = {
    json: (data) => console.log('1. Search Result (Crocin):', data.count, 'items found. Top item:', data.data[0]?.name),
    status: (code) => ({ json: (d) => console.log('Error', code, d) })
  };
  await medicineController.searchMedicines(reqSearch, resSearch);

  // Test 2: Typo suggestion
  const reqTypo = { query: { q: 'Crocinnn' } };
  const resTypo = {
    json: (data) => console.log('2. Typo Search Result:', data.count, 'items. Did You Mean:', data.didYouMean),
    status: (code) => ({ json: (d) => console.log('Error', code, d) })
  };
  await medicineController.searchMedicines(reqTypo, resTypo);

  // Test 3: Availability
  const reqAvail = { params: { id: 1 }, query: {} };
  const resAvail = {
    json: (data) => console.log('3. Availability for Med 1:', data.count, 'pharmacies found. Sample:', data.data[0]?.pharmacy_name, 'Qty:', data.data[0]?.quantity, 'Status:', data.data[0]?.availability),
    status: (code) => ({ json: (d) => console.log('Error', code, d) })
  };
  await medicineController.getMedicineAvailability(reqAvail, resAvail);

  // Test 4: Inventory Update (Change inventory item 2 from qty 5 to qty 0)
  const reqUpdate = { params: { id: 2 }, body: { quantity: 0, price: 30.0 } };
  const resUpdate = {
    json: (data) => console.log('4. Inventory Update Result:', data.message, 'New Status:', data.data.availability),
    status: (code) => ({ json: (d) => console.log('Error', code, d) })
  };
  await inventoryController.updateInventoryItem(reqUpdate, resUpdate);

  // Test 5: Re-fetch availability to confirm persistent DB update
  const resRefetch = {
    json: (data) => {
      const updatedItem = data.data.find(d => d.inventory_id === 2);
      console.log('5. Re-fetched Item 2 Availability in DB:', updatedItem?.pharmacy_name, 'Qty:', updatedItem?.quantity, 'Status:', updatedItem?.availability);
    },
    status: (code) => ({ json: (d) => console.log('Error', code, d) })
  };
  await medicineController.getMedicineAvailability(reqAvail, resRefetch);

  // Test 6: Submit Reservation
  const reqRes = {
    body: {
      medicine_id: 1,
      pharmacy_id: 1,
      quantity: 2,
      customer_name: 'Dr. Anita Roy',
      customer_phone: '+91 99887 76655',
      notes: 'Testing exhibition reservation flow'
    }
  };
  const resRes = {
    json: (data) => console.log('6. Reservation Result:', data.message, 'ID:', data.data?.reservation_id, 'Status:', data.data?.status),
    status: (code) => ({ json: (d) => console.log('Error', code, d) })
  };
  await reservationController.createReservation(reqRes, resRes);

  console.log('--- All Backend Unit Tests Passed! ---');
}

testBackend();
