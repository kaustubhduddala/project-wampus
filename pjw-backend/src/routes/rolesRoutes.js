const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');

router.get('/', rolesController.getAllUserRoles);
router.put('/:userId', rolesController.updateUserRole);

module.exports = router;