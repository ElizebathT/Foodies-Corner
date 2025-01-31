const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Preparing", "Ready for Pickup", "Completed", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    estimatedPreparationTime: {
      type: Number, // in minutes
      default: 30, // Default estimated preparation time
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    paymentDetails: {
      transactionId: String,
      paymentMethod: {
        type: String,
        enum: ["Credit Card", "Debit Card", "UPI", "Cash", "Wallet"],
      },
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Indexing to speed up queries
OrderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
