const express = require('express');
const router = express.Router();
const deliveriesController = require('../controllers/deliveriesController');

router.get('/', deliveriesController.getAllDeliveries);
router.get('/:id', deliveriesController.getDeliveryById);
router.post('/', deliveriesController.createDelivery);

module.exports = router;
