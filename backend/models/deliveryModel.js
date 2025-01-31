const mongoose = require("mongoose");

const DeliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["Awaiting Pickup", "Out for Delivery", "Delivered"],
    default: "Awaiting Pickup",
  },
  estimatedDeliveryTime: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
});

const Delivery = mongoose.model("Delivery", DeliverySchema);
module.exports = Delivery;
