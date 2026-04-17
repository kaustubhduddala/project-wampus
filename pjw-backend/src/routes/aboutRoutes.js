const express = require('express');
const aboutRouter = express.Router();

const aboutController = require('../controllers/aboutController');

aboutRouter.get('/date-started', aboutController.getDateStarted);
aboutRouter.patch('/date-started', aboutController.patchDateStarted);

aboutRouter.get('/exec-entries', aboutController.getAllExecEntries);
aboutRouter.get('/exec-entries/:id', aboutController.getExecEntryById);
aboutRouter.post('/exec-entries', aboutController.createExecEntry);
aboutRouter.patch('/exec-entries/:id', aboutController.updateExecEntry);
aboutRouter.delete('/exec-entries/:id', aboutController.deleteExecEntry);

module.exports = aboutRouter;
