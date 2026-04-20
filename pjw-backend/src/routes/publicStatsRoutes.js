const express = require('express');
const router = express.Router();
const publicStatsController = require('../controllers/publicStatsController');

router.get('/home', publicStatsController.getHomeStats);

module.exports = router;
