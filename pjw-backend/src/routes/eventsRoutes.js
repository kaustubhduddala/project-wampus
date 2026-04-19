const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', eventsController.getEvents);
router.get('/:id', eventsController.getEventById);
router.post('/', verifyAdmin, eventsController.createEvent);
router.put('/:id', verifyAdmin, eventsController.updateEvent);
router.delete('/:id', verifyAdmin, eventsController.deleteEvent);

module.exports = router;
