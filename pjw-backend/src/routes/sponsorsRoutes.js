const express = require('express');
const sponsorsRouter = express.Router();

const sponsorsController = require('../controllers/sponsorsController');

sponsorsRouter.get('/', sponsorsController.getAllSponsors);
sponsorsRouter.get('/:id', sponsorsController.getSponsorById);
sponsorsRouter.post('/', sponsorsController.createSponsor);
sponsorsRouter.put('/:id', sponsorsController.updateSponsor);
sponsorsRouter.delete('/:id', sponsorsController.deleteSponsor);

module.exports = sponsorsRouter;
