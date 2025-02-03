const Delivery = require("../models/deliveryModel");
const express=require('express')
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");

const deliveryController = {
  updateDeliveryStatus: asyncHandler(async (req, res) => {
    const driver = req.user.id;
    const { status } = req.body;

    const delivery = await Delivery.findOne({driver});

    if (!delivery) res.send("Delivery not found");
    delivery.status = status || delivery.status;
    const updatedDelivery = await delivery.save();
    if(!updatedDelivery){
      res.send("Error in updating status")
    }
    res.send(delivery);
  }),

  getDeliveryByOrder: asyncHandler(async (req, res) => {
    const order = await Order.findOne({ user:req.user.id }).populate("delivery")
    if (!order) res.send("Delivery not found");
    res.send(order);
  }),
};

module.exports = deliveryController;
