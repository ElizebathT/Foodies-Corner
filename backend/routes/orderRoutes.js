const express = require("express");
const orderController = require("../controllers/orderController");
const userAuthentication = require("../middlewares/userAuthentication");

const orderRouter = express.Router();

orderRouter.post("/add", userAuthentication, orderController.createOrder);
orderRouter.get("/get", userAuthentication, orderController.getOrdersByUser);
orderRouter.put("/update", userAuthentication, orderController.updateOrderStatus);

module.exports = orderRouter;
