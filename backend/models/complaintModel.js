const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    restaurant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: true },
    subject: { 
        type: String, 
        required: true },
    description: { 
        type: String, 
        required: true },
    status: {
      type: String,
      enum: ['Pending', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    response: { type: String, default: '' },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;
