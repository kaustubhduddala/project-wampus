const express = require('express');
const router = express.Router();
const volunteersController = require('../controllers/volunteersController');

router.get('/', volunteersController.getVolunteerEntries);
router.get('/summary', volunteersController.getVolunteerSummary);

module.exports = router;
