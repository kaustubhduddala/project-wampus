const express = require('express');
const router = express.Router();
const petitionController = require('../controllers/petitionController');
const { requireAuth } = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

router.get('/', petitionController.getPetitions);
router.post('/', requireAuth, requireRole('ADMIN','OWNER'), petitionController.createPetition);
router.put('/:id', requireAuth, requireRole('ADMIN','OWNER'), petitionController.updatePetition);
router.delete('/:id', requireAuth, requireRole('ADMIN','OWNER'), petitionController.deletePetition);

module.exports = router;