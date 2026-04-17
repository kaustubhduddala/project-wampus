const express = require('express');
const router = express.Router();
const fundraisingController = require('../controllers/fundraisingController');

router.get('/', fundraisingController.getMoneyRaised);
router.put('/', fundraisingController.updateMoneyRaised);

module.exports = router;