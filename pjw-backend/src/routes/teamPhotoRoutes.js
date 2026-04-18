const express = require('express');
const teamPhotoRouter = express.Router();

const teamPhotoController = require('../controllers/teamPhotoController');
const requireAuth = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

teamPhotoRouter.get('/', teamPhotoController.getTeamPhoto);
teamPhotoRouter.post('/', requireAuth, requireRole('ADMIN','OWNER'), teamPhotoController.createTeamPhoto);
teamPhotoRouter.put('/', requireAuth, requireRole('ADMIN','OWNER'), teamPhotoController.updateTeamPhoto);
teamPhotoRouter.patch('/', requireAuth, requireRole('ADMIN','OWNER'), teamPhotoController.updateTeamPhoto);
teamPhotoRouter.delete('/', requireAuth, requireRole('ADMIN','OWNER'), teamPhotoController.deleteTeamPhoto);

module.exports = teamPhotoRouter;
