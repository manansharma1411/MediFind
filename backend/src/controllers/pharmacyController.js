const { query, queryOne } = require('../config/db');
const { calculateDistance, BHOPAL_CENTER } = require('../utils/distanceUtils');
const { calculateStockStatus } = require('../utils/stockUtils');

// GET /api/pharmacies
async function getAllPharmacies(req, res) {
  try {
    const userLat = req.query.lat ? parseFloat(req.query.lat) : BHOPAL_CENTER.lat;
    const userLng = req.query.lng ? parseFloat(req.query.lng) : BHOPAL_CENTER.lng;

    const pharmacies = await query('SELECT * FROM pharmacies ORDER BY name ASC');

    const formatted = pharmacies.map(p => ({
      ...p,
      is_open: Boolean(p.is_open),
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      distance_km: calculateDistance(userLat, userLng, p.latitude, p.longitude)
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error in getAllPharmacies:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching pharmacies.' });
  }
}

// GET /api/pharmacies/:id
async function getPharmacyById(req, res) {
  try {
    const { id } = req.params;
    const pharmacy = await queryOne('SELECT * FROM pharmacies WHERE id = ?', [id]);

    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found.' });
    }

    const sql = `
      SELECT 
        i.id AS inventory_id,
        i.quantity,
        i.price,
        m.id AS medicine_id,
        m.name AS medicine_name,
        m.generic_name,
        m.brand_name,
        m.strength,
        m.form
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.id
      WHERE i.pharmacy_id = ?
      ORDER BY m.name ASC
    `;

    const items = await query(sql, [id]);
    const inventory = items.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      price: Number(item.price),
      availability: calculateStockStatus(item.quantity)
    }));

    return res.json({
      success: true,
      data: {
        ...pharmacy,
        is_open: Boolean(pharmacy.is_open),
        latitude: Number(pharmacy.latitude),
        longitude: Number(pharmacy.longitude),
        inventory
      }
    });
  } catch (error) {
    console.error('Error in getPharmacyById:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching pharmacy details.' });
  }
}

module.exports = {
  getAllPharmacies,
  getPharmacyById
};
