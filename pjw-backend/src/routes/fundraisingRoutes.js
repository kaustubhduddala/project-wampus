const express = require('express');
const router = express.Router();

const fundraisingController = require('../controllers/fundraisingController');
const requireAuth = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

router.get('/', fundraisingController.getMoneyRaised);
router.put('/', requireAuth, requireRole('ADMIN','OWNER'), fundraisingController.updateMoneyRaised);

module.exports = router;