const express = require('express');
const router = express.Router();
const petitionController = require('../controllers/petitionController');

router.get('/', petitionController.getPetitions);
router.post('/', petitionController.createPetition);
router.put('/:id', petitionController.updatePetition);
router.delete('/:id', petitionController.deletePetition);

module.exports = router;