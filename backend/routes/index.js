const express=require("express");
const userRoutes = require("./userRoutes");
const restaurantRoutes = require("./restaurantRoutes");
const reviewRouter = require("./reviewRoutes");
const menuRouter = require("./menuRoutes");
const cartRouter = require("./cartRoutes");
const orderRouter = require("./orderRoutes");
const passport = require("passport");
const userController = require("../controllers/userController");
const deliveryRouter = require("./deliveryRoutes");
const adminRouter = require("./adminRoutes");
const complaintRouter = require("./complaintRoutes");
const paymentRoutes = require("./paymentRoutes");
const feedbackRouter = require("./feedbackRoutes");
const notificationRouter = require("./notificationRoutes");
const router=express()

router.use("/payment", paymentRoutes);

router.use(express.json())

router.use("/users", userRoutes);
router.use("/restaurants", restaurantRoutes);
router.use("/reviews", reviewRouter);
router.use("/menus", menuRouter);
router.use("/cart", cartRouter);
router.use("/orders", orderRouter);
router.use("/delivery", deliveryRouter);
router.use("/admin", adminRouter);
router.use("/complaint", complaintRouter);
router.use("/feedback", feedbackRouter);
router.use("/notification", notificationRouter);
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback",passport.authenticate("google", { failureRedirect: "/" }),userController.googleRegister);
 
module.exports=router