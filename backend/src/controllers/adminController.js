const { query, queryOne } = require('../config/db');
const { calculateStockStatus } = require('../utils/stockUtils');

// GET /api/admin/stats
async function getAdminStats(req, res) {
  try {
    const medicinesRes = await queryOne('SELECT COUNT(*) AS count FROM medicines');
    const pharmaciesRes = await queryOne('SELECT COUNT(*) AS count FROM pharmacies');
    const inventoryRes = await queryOne('SELECT COUNT(*) AS count FROM inventory');
    const inventoryItems = await query('SELECT quantity FROM inventory');
    
    let lowStockCount = 0;
    let outOfStockCount = 0;
    inventoryItems.forEach(item => {
      const status = calculateStockStatus(item.quantity);
      if (status === 'low_stock') lowStockCount++;
      if (status === 'out_of_stock') outOfStockCount++;
    });

    const pendingRes = await queryOne("SELECT COUNT(*) AS count FROM reservations WHERE status = 'pending'");
    const acceptedRes = await queryOne("SELECT COUNT(*) AS count FROM reservations WHERE status = 'accepted'");

    return res.json({
      success: true,
      stats: {
        total_medicines: Number(medicinesRes.count || medicinesRes['COUNT(*)'] || 0),
        total_pharmacies: Number(pharmaciesRes.count || pharmaciesRes['COUNT(*)'] || 0),
        total_inventory: Number(inventoryRes.count || inventoryRes['COUNT(*)'] || 0),
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        pending_reservations: Number(pendingRes.count || pendingRes['COUNT(*)'] || 0),
        accepted_reservations: Number(acceptedRes.count || acceptedRes['COUNT(*)'] || 0)
      }
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching admin statistics.' });
  }
}

module.exports = {
  getAdminStats
};
