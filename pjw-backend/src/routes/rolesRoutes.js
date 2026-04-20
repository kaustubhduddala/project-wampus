// routes/rolesRoutes.js
const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { requireAuth } = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

router.get('/', rolesController.getAllUserRoles);
router.put('/:userId', requireAuth, requireRole('OWNER'), rolesController.updateUserRole);

module.exports = router;