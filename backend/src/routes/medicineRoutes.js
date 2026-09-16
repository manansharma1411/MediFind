const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.searchMedicines);
router.get('/:id', medicineController.getMedicineById);
router.get('/:id/availability', medicineController.getMedicineAvailability);

module.exports = router;
