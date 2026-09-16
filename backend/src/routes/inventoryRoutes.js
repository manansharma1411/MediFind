const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getAllInventory);
router.put('/:id', inventoryController.updateInventoryItem);

module.exports = router;
