const express = require('express');
const heatmapRouter = express.Router();
const heatmapController = require('../controllers/heatmapController');
const requireAuth = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

heatmapRouter.get('/', heatmapController.getAllHeatmapPoints);
heatmapRouter.get('/:id', heatmapController.getHeatmapPointById);
heatmapRouter.post('/', requireAuth, requireRole('ADMIN','OWNER'), heatmapController.createHeatmapPoint);
heatmapRouter.patch('/:id', requireAuth, requireRole('ADMIN','OWNER'), heatmapController.updateHeatmapPoint);

module.exports = heatmapRouter;
