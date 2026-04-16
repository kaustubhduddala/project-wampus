const express = require('express');
const heatmapRouter = express.Router();
const heatmapController = require('../controllers/heatmapController');

heatmapRouter.get('/', heatmapController.getAllHeatmapPoints);
heatmapRouter.get('/:id', heatmapController.getHeatmapPointById);
heatmapRouter.post('/', heatmapController.createHeatmapPoint);
heatmapRouter.patch('/:id', heatmapController.updateHeatmapPoint);

module.exports = heatmapRouter;
