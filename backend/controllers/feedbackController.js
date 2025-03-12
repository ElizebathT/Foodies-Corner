const asyncHandler = require("express-async-handler");
const DeliveryFeedback = require("../models/feedbackModel");

const deliveryBoyFeedbackController = {
    
    // Submit feedback for a delivery boy
    submitFeedback: asyncHandler(async (req, res) => {
        const { orderId, deliveryBoyId, rating, comment } = req.body;
        const userId = req.user.id; 
        const feedback = await DeliveryFeedback.create({
            orderId,
            deliveryBoyId,
            userId,
            rating,
            comment,
        });

        res.status(201).json({ message: "Feedback submitted successfully", feedback });
    }),

    // Get feedback for a specific delivery boy
    getFeedbackForDeliveryBoy: asyncHandler(async (req, res) => {
        const { deliveryBoyId } = req.body;

        const feedbacks = await DeliveryFeedback.find({ deliveryBoyId })
            .populate("userId", "name") // Populating user's name
            .sort({ createdAt: -1 });

        res.json(feedbacks);
    }),

    // Get average rating for a delivery boy
    getAverageRating: asyncHandler(async (req, res) => {
        const { deliveryBoyId } = req.body;

        const feedbacks = await DeliveryBoyFeedback.find({ deliveryBoyId });

        if (feedbacks.length === 0) {
            return res.json({ averageRating: 0, totalReviews: 0 });
        }

        const averageRating =
            feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / feedbacks.length;

        res.json({ averageRating: averageRating.toFixed(2), totalReviews: feedbacks.length });
    }),
};

module.exports = deliveryBoyFeedbackController;
