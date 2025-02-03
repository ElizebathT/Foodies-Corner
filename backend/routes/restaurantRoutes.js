const express = require("express");
const restaurantController = require("../controllers/restaurantController");
const userAuthentication = require("../middlewares/userAuthentication");
const  upload  = require("../config/cloudinary");
const restaurantRoutes = express.Router();

restaurantRoutes.get("/display",userAuthentication, restaurantController.display);
restaurantRoutes.post("/add", userAuthentication,upload.single("image"),restaurantController.add);
restaurantRoutes.put("/edit",userAuthentication, restaurantController.edit);
restaurantRoutes.delete("/delete", userAuthentication,restaurantController.delete);
restaurantRoutes.get("/search",userAuthentication, restaurantController.search);
restaurantRoutes.get("/view",userAuthentication, restaurantController.view);
restaurantRoutes.get("/direction",userAuthentication, restaurantController.direction);

module.exports = restaurantRoutes;
