const { query, queryOne } = require('../config/db');
const { getDidYouMeanSuggestion } = require('../utils/searchUtils');
const { calculateDistance, BHOPAL_CENTER } = require('../utils/distanceUtils');
const { calculateStockStatus } = require('../utils/stockUtils');

// GET /api/medicines?q=...
async function searchMedicines(req, res) {
  try {
    const searchQuery = req.query.q ? req.query.q.trim() : '';
    
    if (!searchQuery) {
      const allMedicines = await query('SELECT * FROM medicines ORDER BY name ASC');
      return res.json({
        success: true,
        count: allMedicines.length,
        data: allMedicines,
        didYouMean: null
      });
    }

    const pattern = `%${searchQuery}%`;
    const sql = `
      SELECT * FROM medicines 
      WHERE LOWER(name) LIKE LOWER(?) 
         OR LOWER(generic_name) LIKE LOWER(?) 
         OR LOWER(brand_name) LIKE LOWER(?)
      ORDER BY name ASC
    `;
    
    const results = await query(sql, [pattern, pattern, pattern]);
    let didYouMean = null;

    if (results.length === 0) {
      const allMeds = await query('SELECT id, name, generic_name, brand_name FROM medicines');
      didYouMean = getDidYouMeanSuggestion(searchQuery, allMeds);
    }

    return res.json({
      success: true,
      query: searchQuery,
      count: results.length,
      data: results,
      didYouMean
    });
  } catch (error) {
    console.error('Error in searchMedicines:', error);
    return res.status(500).json({ success: false, message: 'Server error performing search.' });
  }
}

// GET /api/medicines/:id
async function getMedicineById(req, res) {
  try {
    const { id } = req.params;
    const medicine = await queryOne('SELECT * FROM medicines WHERE id = ?', [id]);
    
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    return res.json({ success: true, data: medicine });
  } catch (error) {
    console.error('Error in getMedicineById:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching medicine details.' });
  }
}

// GET /api/medicines/:id/availability
async function getMedicineAvailability(req, res) {
  try {
    const { id } = req.params;
    const userLat = req.query.lat ? parseFloat(req.query.lat) : BHOPAL_CENTER.lat;
    const userLng = req.query.lng ? parseFloat(req.query.lng) : BHOPAL_CENTER.lng;

    const medicine = await queryOne('SELECT * FROM medicines WHERE id = ?', [id]);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const sql = `
      SELECT 
        i.id AS inventory_id,
        i.medicine_id,
        i.pharmacy_id,
        i.quantity,
        i.price,
        i.updated_at AS last_updated,
        p.name AS pharmacy_name,
        p.address,
        p.city,
        p.state,
        p.postal_code,
        p.latitude,
        p.longitude,
        p.is_open,
        p.phone
      FROM inventory i
      JOIN pharmacies p ON i.pharmacy_id = p.id
      WHERE i.medicine_id = ?
      ORDER BY i.quantity DESC, i.price ASC
    `;

    const inventoryRecords = await query(sql, [id]);

    const formattedAvailability = inventoryRecords.map(item => {
      const stockStatus = calculateStockStatus(item.quantity);
      const distanceKm = calculateDistance(userLat, userLng, item.latitude, item.longitude);

      return {
        inventory_id: item.inventory_id,
        medicine_id: item.medicine_id,
        medicine_name: medicine.name,
        generic_name: medicine.generic_name,
        brand_name: medicine.brand_name,
        strength: medicine.strength,
        form: medicine.form,
        pharmacy_id: item.pharmacy_id,
        pharmacy_name: item.pharmacy_name,
        address: `${item.address}, ${item.city}, ${item.state} ${item.postal_code}`,
        phone: item.phone,
        price: Number(item.price),
        quantity: Number(item.quantity),
        availability: stockStatus,
        is_open: Boolean(item.is_open),
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        distance_km: distanceKm,
        last_updated: item.last_updated
      };
    });

    return res.json({
      success: true,
      medicine,
      count: formattedAvailability.length,
      data: formattedAvailability
    });
  } catch (error) {
    console.error('Error in getMedicineAvailability:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching availability.' });
  }
}

module.exports = {
  searchMedicines,
  getMedicineById,
  getMedicineAvailability
};
