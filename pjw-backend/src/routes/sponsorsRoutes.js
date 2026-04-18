const express = require('express');
const sponsorsRouter = express.Router();

const sponsorsController = require('../controllers/sponsorsController');
const requireAuth = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

sponsorsRouter.get('/', sponsorsController.getAllSponsors);
sponsorsRouter.get('/:id', sponsorsController.getSponsorById);
sponsorsRouter.post('/', requireAuth, requireRole('ADMIN','OWNER'), sponsorsController.createSponsor);
sponsorsRouter.put('/:id', requireAuth, requireRole('ADMIN','OWNER'), sponsorsController.updateSponsor);
sponsorsRouter.delete('/:id', requireAuth, requireRole('ADMIN','OWNER'), sponsorsController.deleteSponsor);

module.exports = sponsorsRouter;
