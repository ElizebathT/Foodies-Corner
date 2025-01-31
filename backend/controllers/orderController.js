const Order = require("../models/orderModel");
const Restaurant = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");

const orderController = {
    createOrder: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");
  
        if (!cart || cart.items.length === 0) {
          return res.send("Cart is empty");
        }
  
        const order = new Order({
          user: userId,
          restaurant: cart.items[0].menuItem.restaurant,
          items: cart.items,
          totalAmount: cart.totalAmount,
          paymentStatus: "Pending", 
          estimatedPreparationTime: 30, 
        });
  
        const completed=await order.save();
        await Cart.findOneAndDelete({ user: userId });
        if(!completed){
            res.send('Order creation failed')
        }
        res.send('Order placed successfully');
        
    }),
  
    getOrdersByUser: asyncHandler(async (req, res) => {     
        const orders = await Order.find({ user: req.user.id })
          .populate("restaurant")
          .populate("items.menuItem");
        if(!orders){
          res.send('No orders found')
        }
        res.send(orders);    
    }),
  
    // Update Order Status
    updateOrderStatus: asyncHandler(async (req, res) => {
        const { orderId } = req.body;
        const { status } = req.body;
  
        const validStatuses = [
          "Pending",
          "Accepted",
          "Preparing",
          "Ready for Pickup",
          "Completed",
          "Cancelled",
        ];
  
        if (!validStatuses.includes(status)) {
          res.send("Invalid status" );
        }
  
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  
        if (!order) {
          res.send("Order not found" );
        }
  
        res.send(order);
    }),
  };
module.exports=orderController