const express = require("express");
const router = express.Router();

const moneyRaisedController = require("../controllers/moneyRaisedController");
const requireAuth = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

router.get("/", moneyRaisedController.getTotalMoneyRaised);
router.patch("/", requireAuth, requireRole('ADMIN','OWNER'), moneyRaisedController.patchMoneyRaised);

module.exports = router;