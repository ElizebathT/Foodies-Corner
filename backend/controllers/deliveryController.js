const Delivery = require("../models/deliveryModel");
const express=require('express')
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

const deliveryController = {
  updateDeliveryStatus: asyncHandler(async (req, res) => {
    const driver = req.user.id;
    const { status,otp } = req.body;
    const delivery = await Delivery.findOne({ driver: driver });
    if (!delivery) res.send("Delivery not found");
      
      const order = await Order.findById(delivery.order);
      if (!order) res.send("Order not found");
    if(otp){
      if (otp != order.otp) res.send("Invalid OTP");

      order.status = "Delivered";
      await order.save();
      const driverUser = await User.findOne({ _id: driver });
      driverUser.isAvailable = true;
      await driverUser.save();
      delivery.status ="Delivered"
      await Delivery.deleteOne({driver});
      res.send("Delivery Complete")
    }
    if(status){
    delivery.status = status;
    const updatedDelivery = await delivery.save();
    res.send(updatedDelivery);
    }
    
    
  }),

  getDeliveryByOrder: asyncHandler(async (req, res) => {
    const order = await Order.findOne({ user:req.user.id }).populate("delivery")
    if (!order) res.send("Delivery not found");
    res.send(order);
  }),
};

module.exports = deliveryController;
