const express = require("express");
const checkoutRouter = express.Router();

const checkoutController = require("../controllers/checkoutController");

checkoutRouter.post("/", checkoutController.checkout);

module.exports = checkoutRouter;