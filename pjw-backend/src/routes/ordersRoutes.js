const express = require("express");
const router = express.Router();

const ordersController = require("../controllers/ordersController");
const prisma = require("../db/db");

router.get("/", ordersController.getAllOrders);
router.get("/:id", ordersController.getOrderById);

module.exports = router;