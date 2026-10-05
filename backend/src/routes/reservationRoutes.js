const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', reservationController.createReservation);
router.get('/:id', reservationController.getReservationById);
router.get('/', requireAuth, reservationController.getAllReservations);
router.put('/:id/status', requireAuth, reservationController.updateReservationStatus);

module.exports = router;
