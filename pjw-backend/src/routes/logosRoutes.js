const express = require('express');
const logosRouter = express.Router();

const logosController = require('../controllers/logosController');
const { requireAuth } = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

logosRouter.get('/', logosController.getAllLogos);
logosRouter.get('/:id', logosController.getLogoByClientId);
logosRouter.patch('/:id', requireAuth, requireRole('ADMIN','OWNER'), logosController.updateLogoByClientId);

module.exports = logosRouter;
