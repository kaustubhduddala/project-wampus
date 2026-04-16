const express = require("express");
const router = express.Router();

const moneyRaisedController = require("../controllers/moneyRaisedController");
const prisma = require("../db/db");

router.get("/", moneyRaisedController.getTotalMoneyRaised);

// needs auth middleware
router.patch("/", moneyRaisedController.patchMoneyRaised);

module.exports = router;