const { query, queryOne, execute } = require('../config/db');
const { calculateStockStatus } = require('../utils/stockUtils');

// GET /api/inventory
async function getAllInventory(req, res) {
  try {
    const sql = `
      SELECT 
        i.id AS inventory_id,
        i.quantity,
        i.price,
        i.availability,
        i.updated_at,
        m.id AS medicine_id,
        m.name AS medicine_name,
        m.generic_name,
        m.brand_name,
        m.strength,
        m.form,
        p.id AS pharmacy_id,
        p.name AS pharmacy_name,
        p.address AS pharmacy_address,
        p.is_open
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.id
      JOIN pharmacies p ON i.pharmacy_id = p.id
      ORDER BY p.name ASC, m.name ASC
    `;

    const records = await query(sql);

    const formatted = records.map(r => ({
      inventory_id: r.inventory_id,
      medicine_id: r.medicine_id,
      medicine_name: r.medicine_name,
      generic_name: r.generic_name,
      brand_name: r.brand_name,
      strength: r.strength,
      form: r.form,
      pharmacy_id: r.pharmacy_id,
      pharmacy_name: r.pharmacy_name,
      pharmacy_address: r.pharmacy_address,
      quantity: Number(r.quantity),
      price: Number(r.price),
      availability: calculateStockStatus(r.quantity),
      is_open: Boolean(r.is_open),
      updated_at: r.updated_at
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error in getAllInventory:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching inventory records.' });
  }
}

// PUT /api/inventory/:id
async function updateInventoryItem(req, res) {
  try {
    const { id } = req.params;
    const { quantity, price } = req.body;

    if (quantity === undefined || quantity === null || isNaN(Number(quantity))) {
      return res.status(400).json({ success: false, message: 'Valid non-negative quantity is required.' });
    }

    const numQuantity = Number(quantity);
    if (numQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Quantity cannot be negative.' });
    }

    const existing = await queryOne('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Inventory record not found.' });
    }

    const numPrice = price !== undefined && !isNaN(Number(price)) ? Number(price) : existing.price;
    if (numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
    }

    // Recalculate stock status strictly from database quantity
    const newAvailability = calculateStockStatus(numQuantity);
    const nowIso = new Date().toISOString();

    await execute(
      'UPDATE inventory SET quantity = ?, price = ?, availability = ?, updated_at = ? WHERE id = ?',
      [numQuantity, numPrice, newAvailability, nowIso, id]
    );

    // Re-fetch updated record with joined medicine and pharmacy info
    const updatedSql = `
      SELECT 
        i.id AS inventory_id,
        i.quantity,
        i.price,
        i.availability,
        i.updated_at,
        m.id AS medicine_id,
        m.name AS medicine_name,
        p.id AS pharmacy_id,
        p.name AS pharmacy_name
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.id
      JOIN pharmacies p ON i.pharmacy_id = p.id
      WHERE i.id = ?
    `;

    const updatedRecord = await queryOne(updatedSql, [id]);

    return res.json({
      success: true,
      message: `Inventory successfully updated for ${updatedRecord.medicine_name} at ${updatedRecord.pharmacy_name}.`,
      data: {
        inventory_id: updatedRecord.inventory_id,
        medicine_id: updatedRecord.medicine_id,
        medicine_name: updatedRecord.medicine_name,
        pharmacy_id: updatedRecord.pharmacy_id,
        pharmacy_name: updatedRecord.pharmacy_name,
        quantity: Number(updatedRecord.quantity),
        price: Number(updatedRecord.price),
        availability: calculateStockStatus(updatedRecord.quantity),
        updated_at: updatedRecord.updated_at
      }
    });
  } catch (error) {
    console.error('Error in updateInventoryItem:', error);
    return res.status(500).json({ success: false, message: 'Server error updating inventory.' });
  }
}

module.exports = {
  getAllInventory,
  updateInventoryItem
};
