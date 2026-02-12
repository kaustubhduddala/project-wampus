const express = require("express");
const router = express.Router();

const ordersController = require("../controllers/ordersController");

router.get("/", ordersController.getAllOrders);
router.get("/:id", ordersController.getOrderById);

module.exports = router;