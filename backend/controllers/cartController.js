const Cart = require("../models/cartModel");
const MenuItem = require("../models/menuItemModel");
const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/restaurantModel");

const cartController={
    addToCart : asyncHandler(async (req, res) => {
        const { name, quantity, restaurantName } = req.body;
        const userId = req.user.id;
      
        // Find or create the user's cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
          cart = new Cart({ user: userId, items: [], totalAmount: 0 });
        }
      
        // Check if restaurant exists
        const restaurantExist = await Restaurant.findOne({ name: restaurantName });
        if (!restaurantExist) {
          return res.status(404).json({ message: "Restaurant not found" });
        }
      
        const restaurantId = restaurantExist._id;
      
        // Check if menu item exists in that restaurant
        const menuItem = await MenuItem.findOne({ name, restaurant: restaurantId });
        if (!menuItem) {
          return res.status(404).json({ message: "Item not found" });
        }
      
        const menuItemId = menuItem._id.toString();
      
        // Check if item is already in the cart
        const itemIndex = cart.items.findIndex((item) => item.menuItem.toString() === menuItemId);
      
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += quantity;
        } else {
          cart.items.push({ menuItem: menuItemId, quantity });
        }
      
        cart.totalAmount = cart.totalAmount + quantity * menuItem.price
      
        // Save the updated cart
        await cart.save();
        res.json(cart);
      }),

    getCart : asyncHandler(async (req, res) => {    
        const cart = await Cart.findOne({ user: req.user.id }).populate("items.menuItem");
        if (!cart) return res.json({ items: [] });
        res.json(cart);
        res.status(500).json({ error: error.message });    
    }),

    removeFromCart:asyncHandler(async (req, res) => {
        const { name } = req.body;
        const userId = req.user.id;
      
        let cart = await Cart.findOne({ user: userId }).populate("items.menuItem");
        if (!cart) res.send("Cart not found");
      
        const menuItem = await MenuItem.findOne({ name });
        if (!menuItem) return res.send("Menu item not found");
      
        const menuItemId = menuItem._id.toString(); 
      
        cart.items = cart.items.filter((item) => item.menuItem._id.toString() !== menuItemId);
      
        cart.totalAmount = cart.items.reduce((total, item) => {
          return total + item.quantity * item.menuItem.price;
        }, 0);
      
        const updatedCart = await cart.save();
        if (!updatedCart) {
          return res.send("Failed to remove from cart");
        }      
        res.send("Item Removed!");
      }),

    clearCart :asyncHandler(async (req, res) => {  
    const completed=await Cart.findOneAndDelete({ user: req.user.id });
    if(!completed){
        res.send("Failed to delete Cart");  
    }
    res.send("Cart cleared");  
    
    })
}
module.exports=cartController