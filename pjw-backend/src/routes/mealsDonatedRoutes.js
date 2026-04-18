const express = require("express");
const router = express.Router();

const mealsDonatedController = require("../controllers/mealsDonatedController");
const requireAuth = require("../middleware/auth");
const requireRole = require('../middleware/requireRole');

router.get("/", mealsDonatedController.getTotalMealsDonated);
router.patch("/", requireAuth, requireRole('ADMIN','OWNER'), mealsDonatedController.patchMealsDonated);

module.exports = router;