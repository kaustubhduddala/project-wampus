const express = require("express");
const heatmapRouter = express.Router();

const heatmapController = require("../controllers/heatmapController");

heatmapRouter.get("/", heatmapController.getAllPoints);

module.exports = heatmapRouter;
