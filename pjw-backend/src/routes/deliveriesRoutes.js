const express = require('express');
const router = express.Router();
const deliveriesController = require('../controllers/deliveriesController');
const { verifyMember } = require('../middleware/auth');

router.get('/', deliveriesController.getAllDeliveries);
router.get('/:id', deliveriesController.getDeliveryById);
router.post('/', verifyMember, deliveriesController.createDelivery);

module.exports = router;
