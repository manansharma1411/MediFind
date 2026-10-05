const { query, queryOne, execute } = require('../config/db');
const { calculateStockStatus } = require('../utils/stockUtils');

// POST /api/reservations
async function createReservation(req, res) {
  try {
    const { medicine_id, pharmacy_id, quantity, customer_name, customer_phone, notes } = req.body;

    if (!medicine_id || !pharmacy_id) {
      return res.status(400).json({ success: false, message: 'medicine_id and pharmacy_id are required.' });
    }

    const numQty = Number(quantity || 1);
    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ success: false, message: 'Reservation quantity must be greater than 0.' });
    }

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }

    if (!customer_phone || !customer_phone.trim()) {
      return res.status(400).json({ success: false, message: 'Customer phone number is required.' });
    }

    // Check if medicine and pharmacy exist
    const medicine = await queryOne('SELECT * FROM medicines WHERE id = ?', [medicine_id]);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const pharmacy = await queryOne('SELECT * FROM pharmacies WHERE id = ?', [pharmacy_id]);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found.' });
    }

    // Check inventory stock availability
    const inventory = await queryOne(
      'SELECT * FROM inventory WHERE medicine_id = ? AND pharmacy_id = ?',
      [medicine_id, pharmacy_id]
    );

    if (!inventory || inventory.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `Reservation failed: ${medicine.name} is currently out of stock at ${pharmacy.name}.`
      });
    }

    if (numQty > inventory.quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${numQty}) exceeds available stock (${inventory.quantity}).`
      });
    }

    const nowIso = new Date().toISOString();
    const result = await execute(
      `INSERT INTO reservations (medicine_id, pharmacy_id, quantity, status, customer_name, customer_phone, notes, created_at, updated_at) 
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [medicine_id, pharmacy_id, numQty, customer_name.trim(), customer_phone.trim(), notes ? notes.trim() : '', nowIso, nowIso]
    );

    const reservationId = result.lastInsertRowid;

    return res.status(201).json({
      success: true,
      message: 'Reservation request successfully submitted and recorded.',
      data: {
        reservation_id: reservationId,
        medicine_id,
        medicine_name: medicine.name,
        pharmacy_id,
        pharmacy_name: pharmacy.name,
        quantity: numQty,
        unit_price: Number(inventory.price),
        total_estimated_price: Math.round(Number(inventory.price) * numQty * 100) / 100,
        status: 'pending',
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        notes: notes ? notes.trim() : '',
        created_at: nowIso
      }
    });
  } catch (error) {
    console.error('Error in createReservation:', error);
    return res.status(500).json({ success: false, message: 'Server error processing reservation.' });
  }
}

// GET /api/reservations
async function getAllReservations(req, res) {
  try {
    const sql = `
      SELECT 
        r.id AS reservation_id,
        r.quantity,
        r.status,
        r.customer_name,
        r.customer_phone,
        r.notes,
        r.created_at,
        r.updated_at,
        m.id AS medicine_id,
        m.name AS medicine_name,
        m.generic_name,
        p.id AS pharmacy_id,
        p.name AS pharmacy_name,
        p.address AS pharmacy_address,
        p.phone AS pharmacy_phone,
        i.price,
        i.quantity AS current_stock
      FROM reservations r
      JOIN medicines m ON r.medicine_id = m.id
      JOIN pharmacies p ON r.pharmacy_id = p.id
      LEFT JOIN inventory i ON (r.medicine_id = i.medicine_id AND r.pharmacy_id = i.pharmacy_id)
      ORDER BY r.created_at DESC
    `;

    const records = await query(sql);

    const formatted = records.map(r => ({
      reservation_id: r.reservation_id,
      medicine_id: r.medicine_id,
      medicine_name: r.medicine_name,
      generic_name: r.generic_name,
      pharmacy_id: r.pharmacy_id,
      pharmacy_name: r.pharmacy_name,
      pharmacy_address: r.pharmacy_address,
      pharmacy_phone: r.pharmacy_phone,
      quantity: Number(r.quantity),
      current_stock: r.current_stock != null ? Number(r.current_stock) : 0,
      unit_price: r.price ? Number(r.price) : 0,
      total_price: r.price ? Math.round(Number(r.price) * Number(r.quantity) * 100) / 100 : 0,
      status: r.status,
      customer_name: r.customer_name,
      customer_phone: r.customer_phone,
      notes: r.notes,
      created_at: r.created_at,
      updated_at: r.updated_at
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('Error in getAllReservations:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching reservations.' });
  }
}

// GET /api/reservations/:id
async function getReservationById(req, res) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        r.id AS reservation_id,
        r.quantity,
        r.status,
        r.customer_name,
        r.customer_phone,
        r.notes,
        r.created_at,
        m.id AS medicine_id,
        m.name AS medicine_name,
        m.generic_name,
        m.strength,
        m.form,
        p.id AS pharmacy_id,
        p.name AS pharmacy_name,
        p.address AS pharmacy_address,
        p.phone AS pharmacy_phone,
        p.latitude,
        p.longitude,
        i.price
      FROM reservations r
      JOIN medicines m ON r.medicine_id = m.id
      JOIN pharmacies p ON r.pharmacy_id = p.id
      LEFT JOIN inventory i ON (r.medicine_id = i.medicine_id AND r.pharmacy_id = i.pharmacy_id)
      WHERE r.id = ?
    `;

    const record = await queryOne(sql, [id]);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    return res.json({
      success: true,
      data: {
        reservation_id: record.reservation_id,
        medicine_id: record.medicine_id,
        medicine_name: record.medicine_name,
        generic_name: record.generic_name,
        strength: record.strength,
        form: record.form,
        pharmacy_id: record.pharmacy_id,
        pharmacy_name: record.pharmacy_name,
        pharmacy_address: record.pharmacy_address,
        pharmacy_phone: record.pharmacy_phone,
        latitude: Number(record.latitude),
        longitude: Number(record.longitude),
        quantity: Number(record.quantity),
        unit_price: record.price ? Number(record.price) : 0,
        total_price: record.price ? Math.round(Number(record.price) * Number(record.quantity) * 100) / 100 : 0,
        status: record.status,
        customer_name: record.customer_name,
        customer_phone: record.customer_phone,
        notes: record.notes,
        created_at: record.created_at
      }
    });
  } catch (error) {
    console.error('Error in getReservationById:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching reservation details.' });
  }
}

// PUT /api/reservations/:id/status
async function updateReservationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'accepted', 'cancelled', 'completed'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const reservation = await queryOne('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const prevStatus = reservation.status;
    const { medicine_id, pharmacy_id, quantity: resQty } = reservation;

    const inventory = await queryOne(
      'SELECT * FROM inventory WHERE medicine_id = ? AND pharmacy_id = ?',
      [medicine_id, pharmacy_id]
    );

    const nowIso = new Date().toISOString();

    // If accepting a pending reservation, deduct inventory stock
    if (status === 'accepted' && prevStatus !== 'accepted') {
      if (!inventory || inventory.quantity < resQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot accept reservation: Insufficient inventory stock (${inventory ? inventory.quantity : 0} available, ${resQty} requested).`
        });
      }

      const newQty = inventory.quantity - resQty;
      const newAvailability = calculateStockStatus(newQty);

      await execute(
        'UPDATE inventory SET quantity = ?, availability = ?, updated_at = ? WHERE id = ?',
        [newQty, newAvailability, nowIso, inventory.id]
      );
    }

    // If cancelling an accepted reservation, restore inventory stock
    if (status === 'cancelled' && prevStatus === 'accepted') {
      if (inventory) {
        const newQty = inventory.quantity + resQty;
        const newAvailability = calculateStockStatus(newQty);

        await execute(
          'UPDATE inventory SET quantity = ?, availability = ?, updated_at = ? WHERE id = ?',
          [newQty, newAvailability, nowIso, inventory.id]
        );
      }
    }

    await execute(
      'UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?',
      [status, nowIso, id]
    );

    return res.json({
      success: true,
      message: `Reservation #${id} status successfully updated to ${status}.`,
      data: {
        reservation_id: Number(id),
        status,
        updated_at: nowIso
      }
    });
  } catch (error) {
    console.error('Error in updateReservationStatus:', error);
    return res.status(500).json({ success: false, message: 'Server error updating reservation status.' });
  }
}

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservationStatus
};
