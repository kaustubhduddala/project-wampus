const express = require("express");
const storeItemsRouter = express.Router();

const storeItemsController = require("../controllers/storeItemsController");

storeItemsRouter.get("/", storeItemsController.getAllItems);
storeItemsRouter.get("/:id", storeItemsController.getItemById);

module.exports = storeItemsRouter;