const express = require('express');
const router = express.Router();
const adminStatsController = require('../controllers/adminStatsController');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/', requireAuth, adminStatsController.getAdminStats);
router.put('/', requireAuth, requireRole('ADMIN','OWNER'), adminStatsController.updateAdminStats);

module.exports = router;