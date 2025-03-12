const express = require("express");
const feedbackRouter = express.Router();
const deliveryBoyFeedbackController = require("../controllers/feedbackController");
const userAuthentication = require("../middlewares/userAuthentication");

feedbackRouter.post("/add", userAuthentication, deliveryBoyFeedbackController.submitFeedback);
feedbackRouter.get("/view", userAuthentication,deliveryBoyFeedbackController.getFeedbackForDeliveryBoy);
feedbackRouter.get("/rating", userAuthentication,deliveryBoyFeedbackController.getAverageRating);

module.exports = feedbackRouter;
