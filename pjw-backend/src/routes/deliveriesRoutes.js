const express = require('express');
const router = express.Router();
const deliveriesController = require('../controllers/deliveriesController');
const { verifyAdmin, verifyMember } = require('../middleware/auth');

router.get('/', deliveriesController.getAllDeliveries);
router.get('/:id', deliveriesController.getDeliveryById);
router.post('/', verifyMember, deliveriesController.createDelivery);
router.delete('/:id', verifyAdmin, deliveriesController.deleteDelivery);

module.exports = router;
