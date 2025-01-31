const express = require("express");
const menuController = require("../controllers/menuController");
const userAuthentication = require("../middlewares/userAuthentication");
const menuRouter = express.Router();

menuRouter.post("/add", userAuthentication,menuController.createMenuItem);

menuRouter.get("/viewall", userAuthentication,menuController.getAllMenuItems);

menuRouter.get("/display", userAuthentication,menuController.getMenuItemsByRestaurant);

menuRouter.get("/search",userAuthentication, menuController.getMenuItemById);

menuRouter.put("/edit",userAuthentication, menuController.updateMenuItem);

menuRouter.delete("/delete", userAuthentication,menuController.deleteMenuItem);

module.exports = menuRouter;
