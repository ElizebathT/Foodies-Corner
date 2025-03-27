const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  googleMapsUrl:{
    type:String
  },
  image: { 
    type: String 
  },
  closing_days: { 
    type: String 
  },
  notes: { 
    type: String 
  },
  menu: [
    { type: mongoose.Schema.Types.ObjectId, 
      ref: "MenuItem" 
    }
  ],
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  reviews: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Review" }
  ],
  contact: { 
    type: String,  
    required: true 
  },
  cuisine: [{ 
    type: String, 
    required: true 
  }],
  opening_hours: {
    type: String,  
    required: true
  },
  address:{
    type:String,
  },
  verified:{
    type:Boolean,
    default:false
  },
  license: {
    type: String,  
    required: true
  },
});


const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
module.exports = Restaurant;
