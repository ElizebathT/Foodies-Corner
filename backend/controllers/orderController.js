const Order = require("../models/orderModel");
const Restaurant = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Delivery = require("../models/deliveryModel");
const crypto = require('crypto');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999);
}

const orderController = {
  createOrder: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { address, contact } = req.user;  // Get delivery address and contact number from req.user
    const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");

    if (!cart || cart.items.length === 0) {
        return res.send("Cart is empty");
    }

    const driver = await User.findOne({ role: "driver", isAvailable: true });

    if (!driver) {
        return res.status(500).send("No available drivers at the moment.");
    }

    const delivery = new Delivery({
        restaurant: cart.items[0].menuItem.restaurant,
        driver: driver._id, // Assign driver
        status: "Out for Delivery",
        estimatedDeliveryTime: 60
    });

    const otp = generateOTP();
    const order = new Order({
        user: userId,
        restaurant: cart.items[0].menuItem.restaurant,
        items: cart.items,
        otp: otp,
        totalAmount: cart.totalAmount,
        paymentStatus: "Pending",
        estimatedPreparationTime: 30,
        delivery: delivery.id,
        address: address, // Add delivery address to the order
        contact: contact, // Add contact number to the order
    });

    const completed = await order.save();
    if (!completed) {
        res.send('Order creation failed');
    }

    delivery.order = order.id;
    const deliveryCreated = await delivery.save();
    if (!deliveryCreated) {
        res.send('Delivery not initiated');
    }

    driver.isAvailable = false;
    await driver.save();

    await Cart.findOneAndDelete({ user: userId });

    res.send('Order placed successfully');
  }),

  
    getOrdersByUser: asyncHandler(async (req, res) => {     
      console.log('hi');
        const orders = await Order.find({ user: req.user.id })
          .populate("restaurant")
          .populate("items.menuItem");
          
          
        if(!orders){
          res.send('No orders found')
        }
        res.send(orders);    
    }),
  
    
  };
module.exports=orderController