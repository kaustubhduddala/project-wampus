const express = require('express');
const router = express.Router();
const advocacyUpdatesController = require('../controllers/advocacyUpdatesController');

router.get('/', advocacyUpdatesController.getAllUpdates);
router.get('/:id', advocacyUpdatesController.getUpdateById);
router.post('/', advocacyUpdatesController.createUpdate);
router.patch('/:id', advocacyUpdatesController.updateUpdate);
router.delete('/:id', advocacyUpdatesController.deleteUpdate);

module.exports = router;
