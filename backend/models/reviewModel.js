const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Restaurant", 
    required: true 
  },
  comment: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 10
  },
  categories: [{ type: String }], // Categories assigned based on text analysis
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Enable full-text search indexing for efficient filtering
ReviewSchema.index({ comment: "text" });


const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
