const express = require('express');
const router = express.Router();
const adminStatsController = require('../controllers/adminStatsController');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, adminStatsController.getAdminStats);
router.put('/', requireAuth, adminStatsController.updateAdminStats);

module.exports = router;