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
  opening_time: {
    type: String,  
    required: true
  },
  closing_time: {
    type: String,  
    required: true
  },
  address:{
    type:String,
  }
});


const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
module.exports = Restaurant;
