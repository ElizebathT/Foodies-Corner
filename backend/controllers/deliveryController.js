const Delivery = require("../models/deliveryModel");
const express=require('express')
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const crypto = require('crypto');


const generateOTP = () => {
  return crypto.randomInt(100000, 999999);
}

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
  sendOTP:asyncHandler(async (req, res) => {
    const otp = generateOTP();
    const client=req.client
    const driver = req.user.id;
    const delivery = await Delivery.findOne({ driver: driver });
    if(!delivery){
      res.send('Delivery not found')
    }
    const order = await Order.findById(delivery.order);
    order.otp=otp
    await order.save()
    const phoneNumber="+91"+order.contact
      const message = await client.messages.create({
        body: `Your OTP code is: ${otp}`,
        from: req.number,
        to:phoneNumber,
      });

      console.log("OTP sent successfully:", message.sid);
      if(!message){
        res.send("Error sending OTP")
      }
      res.json({otp}) 
  }),

  // sendOTP:asyncHandler(async (req, res) => {
  //   const otp = generateOTP();
  //     const driver = req.user.id;
  //     const delivery = await Delivery.findOne({ driver: driver });
  //     if(!delivery){
  //       res.send('Delivery not found')
  //     }
  //     const order = await Order.findById(delivery.order);
  //     const phoneNumber=order.contact
  
  
  //       console.log("OTP sent successfully:", message.sid);
  //       if(!message){
  //         res.send("Error sending OTP")
  //       }
  //       res.send(otp) 
  // }),

  getDeliveryByOrder: asyncHandler(async (req, res) => {
    const order = await Order.findOne({ user:req.user.id }).populate("delivery")
    if (!order) res.send("Delivery not found");
    res.send(order);
  }),
};

module.exports = deliveryController;
