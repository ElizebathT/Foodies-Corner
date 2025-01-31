const express=require("express");
const userRoutes = require("./userRoutes");
const restaurantRoutes = require("./restaurantRoutes");
const reviewRouter = require("./reviewRoutes");
const menuRouter = require("./menuRoutes");
const cartRouter = require("./cartRoutes");
const orderRouter = require("./orderRoutes");
const passport = require("passport");
const userController = require("../controllers/userController");
const router=express()

router.use("/users", userRoutes);
router.use("/restaurants", restaurantRoutes);
router.use("/reviews", reviewRouter);
router.use("/menus", menuRouter);
router.use("/cart", cartRouter);
router.use("/orders", orderRouter);
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback",passport.authenticate("google", { failureRedirect: "/" }),userController.googleRegister);
 
module.exports=router