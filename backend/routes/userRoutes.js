const express = require("express");
const userController = require("../controllers/userController");
const userAuthentication = require("../middlewares/userAuthentication");
const userRoutes = express.Router();

userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);
userRoutes.put("/edit", userAuthentication,userController.profile);
userRoutes.delete("/logout", userController.logout);
userRoutes.get("/view", userAuthentication,userController.getUserProfile);
userRoutes.get("/verify", userController.verifyEmail);
userRoutes.post("/forgot", userController.forgotPassword);
userRoutes.put("/reset", userController.resetPassword);
userRoutes.put("/password", userAuthentication,userController.changePassword);

module.exports = userRoutes;
