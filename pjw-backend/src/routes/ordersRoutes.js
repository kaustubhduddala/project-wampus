const express = require("express");
const router = express.Router();

const ordersController = require("../controllers/ordersController");


const requireAuth = require("../middleware/auth"); 

//Apply the middleware to protected routes
router.get("/", requireAuth, ordersController.getAllOrders);
router.get("/:id", requireAuth, ordersController.getOrderById);

module.exports = router;