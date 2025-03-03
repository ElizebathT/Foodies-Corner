const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Restaurant = require("../models/restaurantModel");
const Order = require("../models/orderModel");

const adminController={
    getDashboardData :asyncHandler(async (req, res) => {
          const userCount = await User.find();
          const restaurantCount = await Restaurant.find();
          const orderCount = await Order.find();
      
          const dashboard = {
            userCount,
            restaurantCount,
            orderCount,
          };
      
          res.send(dashboard);
        
      }),
      
    verifyUser:asyncHandler(async (req, res) => {
        const {email}=req.body
        const user= await User.findOne({email})
        if(!user){
            throw new Error('User not found')
        }
        user.verified=true
        await user.save()
        res.send("User verified")
    }),

    verifyRestaurant:asyncHandler(async (req, res) => {
        const {id}=req.body
        const restaurant= await Restaurant.findById(id)
        if(!restaurant){
            throw new Error('Restaurant not found')
        }
        restaurant.verified=true
        await restaurant.save()
        res.send("Restaurant verified")
    }),

    displayRestaurants: asyncHandler(async (req, res) => {
        const restaurants = await Restaurant.find({verified:false});
        res.send(restaurants);
    }),
}
module.exports=adminController