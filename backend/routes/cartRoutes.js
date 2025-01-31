const express = require("express");
const cartController = require("../controllers/cartController");
const userAuthentication = require("../middlewares/userAuthentication");

const cartRouter = express.Router();

cartRouter.post("/add", userAuthentication, cartController.addToCart);
cartRouter.get("/get", userAuthentication, cartController.getCart);
cartRouter.delete("/del", userAuthentication, cartController.removeFromCart);
cartRouter.delete("/clr", userAuthentication, cartController.clearCart);

module.exports = cartRouter;
