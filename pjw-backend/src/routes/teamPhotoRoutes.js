const express = require('express');
const teamPhotoRouter = express.Router();

const teamPhotoController = require('../controllers/teamPhotoController');

teamPhotoRouter.get('/', teamPhotoController.getTeamPhoto);
teamPhotoRouter.post('/', teamPhotoController.createTeamPhoto);
teamPhotoRouter.put('/', teamPhotoController.updateTeamPhoto);
teamPhotoRouter.patch('/', teamPhotoController.updateTeamPhoto);
teamPhotoRouter.delete('/', teamPhotoController.deleteTeamPhoto);

module.exports = teamPhotoRouter;
