const mongoose = require("mongoose");

const DeliveryBoyFeedbackSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming delivery boys are stored in the User model
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
    },
});

const DeliveryFeedback = mongoose.model("DeliveryFeedback", DeliveryBoyFeedbackSchema);
module.exports = DeliveryFeedback;