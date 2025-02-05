const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  },
  image: { 
    type: String 
  },
  category: {
    type: String,
    enum: ["Appetizer", "Main Course", "Dessert", "Beverage", "Side Dish"],
    required: true
  },
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Restaurant", 
    required: true 
  },
  availability: { 
    type: Boolean, 
    default: true 
  },
  discount: {
    percentage: { 
      type: Number, 
      default: 0 
    },  
    validUntil: { 
      type: Date 
    } 
  },
});

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
module.exports = MenuItem;
