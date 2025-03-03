const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique:true,
        minLength:[5,"Minimum 5 characters required"],
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    minLength:[5,"Minimum 5 characters required"]
  },
  address: { 
    type: String ,
    minLength:[5,"Minimum 5 characters required"]
  },
  role: { 
    type: String, 
    enum: ["customer", "restaurant","driver","admin"], 
    default: "customer" 
  },
  isAvailable: {
    type:Boolean,
    default:true
  },
  dietaryPreferences: {
    type: [String],
    default: []
  },
  allergies: {
    type: [String],
    default: []
  },
  verified: {
    type: Boolean, 
    default: false 
  },
  verificationToken: String
});


const User = mongoose.model("User", UserSchema);
module.exports = User;
