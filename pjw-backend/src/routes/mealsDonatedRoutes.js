const express = require("express");
const router = express.Router();

const mealsDonatedController = require("../controllers/mealsDonatedController");

router.get("/", mealsDonatedController.getTotalMealsDonated);

// needs auth middleware
router.patch("/", mealsDonatedController.patchMealsDonated);

module.exports = router;