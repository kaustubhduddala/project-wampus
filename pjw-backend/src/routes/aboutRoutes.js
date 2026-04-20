const express = require('express');
const aboutRouter = express.Router();

const aboutController = require('../controllers/aboutController');
const { requireAuth } = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

aboutRouter.get('/date-started', aboutController.getDateStarted);
aboutRouter.patch('/date-started', requireAuth, requireRole('ADMIN','OWNER'), aboutController.patchDateStarted);

aboutRouter.get('/exec-entries', aboutController.getAllExecEntries);
aboutRouter.get('/exec-entries/:id', aboutController.getExecEntryById);
aboutRouter.post('/exec-entries', requireAuth, requireRole('ADMIN','OWNER'), aboutController.createExecEntry);
aboutRouter.patch('/exec-entries/:id', requireAuth, requireRole('ADMIN','OWNER'), aboutController.updateExecEntry);
aboutRouter.delete('/exec-entries/:id', requireAuth, requireRole('ADMIN','OWNER'), aboutController.deleteExecEntry);

module.exports = aboutRouter;
