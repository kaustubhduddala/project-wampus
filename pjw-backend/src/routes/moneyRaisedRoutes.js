const express = require("express");
const router = express.Router();

const moneyRaisedController = require("../controllers/moneyRaisedController");

router.get("/", moneyRaisedController.getTotalMoneyRaised);

// needs auth middleware
router.patch("/", moneyRaisedController.patchMoneyRaised);

module.exports = router;