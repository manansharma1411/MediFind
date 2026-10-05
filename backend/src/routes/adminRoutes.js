const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const inventoryController = require('../controllers/inventoryController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/stats', requireAuth, adminController.getAdminStats);
router.put('/inventory/:id', requireAuth, inventoryController.updateInventoryItem);

module.exports = router;
