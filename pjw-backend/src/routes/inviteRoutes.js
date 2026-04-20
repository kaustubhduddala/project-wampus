const express = require('express');
const router = express.Router();
const { inviteController } = require('../controllers/inviteController');
const { verifyAdmin } = require('../middleware/auth');

router.post('/', verifyAdmin, inviteController.createInvite);
router.get('/', verifyAdmin, inviteController.getPendingInvites);
router.get('/:token', inviteController.validateInviteToken);
router.delete('/:token', verifyAdmin, inviteController.revokeInvite);

module.exports = router;
