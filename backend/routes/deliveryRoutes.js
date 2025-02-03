const express = require("express");
const deliveryController = require("../controllers/deliveryController");
const userAuthentication = require("../middlewares/userAuthentication");

const deliveryRouter = express.Router();

deliveryRouter.put("/update", userAuthentication, deliveryController.updateDeliveryStatus);
deliveryRouter.get("/get", userAuthentication, deliveryController.getDeliveryByOrder);

module.exports = deliveryRouter;
