const express = require('express');
const teamPhotoRouter = express.Router();

const teamPhotoController = require('../controllers/teamPhotoController');

teamPhotoRouter.post('/', teamPhotoController.createTeamPhoto);

module.exports = teamPhotoRouter;
