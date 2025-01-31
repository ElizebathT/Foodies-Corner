const express = require("express");
const restaurantController = require("../controllers/restaurantController");
const userAuthentication = require("../middlewares/userAuthentication");
const restaurantRoutes = express.Router();

restaurantRoutes.get("/display",userAuthentication, restaurantController.display);
restaurantRoutes.post("/add", userAuthentication,restaurantController.add);
restaurantRoutes.put("/edit",userAuthentication, restaurantController.edit);
restaurantRoutes.delete("/delete", userAuthentication,restaurantController.delete);
restaurantRoutes.get("/search",userAuthentication, restaurantController.search);

module.exports = restaurantRoutes;
