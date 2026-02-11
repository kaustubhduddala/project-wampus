const express = require('express');
const logosRouter = express.Router();

const logosController = require('../controllers/logosController');

logosRouter.get('/', logosController.getAllLogos);
logosRouter.get('/:id', logosController.getLogoByClientId);
logosRouter.patch('/:id', logosController.updateLogoByClientId);

module.exports = logosRouter;
