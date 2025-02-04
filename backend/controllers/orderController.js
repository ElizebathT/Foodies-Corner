const Order = require("../models/orderModel");
const Restaurant = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Delivery = require("../models/deliveryModel");


const orderController = {
  createOrder: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { address, contact } = req.body;  
    const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");

    if (!cart || cart.items.length === 0) {
        return res.send("Cart is empty");
    }

    const driver = await User.findOne({ role: "driver", isAvailable: true });

    if (!driver) {
        return res.status(500).send("No available drivers at the moment.");
    }

    const delivery = new Delivery({
        restaurant: cart.items[0].menuItem.restaurant,
        driver: driver._id, // Assign driver
        status: "Out for Delivery",
        estimatedDeliveryTime: 60
    });
    const order = new Order({
        user: userId,
        restaurant: cart.items[0].menuItem.restaurant,
        items: cart.items,
        totalAmount: cart.totalAmount,
        paymentStatus: "Pending",
        estimatedPreparationTime: 30,
        delivery: delivery.id,
        address,
        contact, 
    });

    const completed = await order.save();
    if (!completed) {
        res.send('Order creation failed');
    }

    delivery.order = order.id;
    const deliveryCreated = await delivery.save();
    if (!deliveryCreated) {
        res.send('Delivery not initiated');
    }

    driver.isAvailable = false;
    await driver.save();

    await Cart.findOneAndDelete({ user: userId });

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
    cancelOrder:asyncHandler(async (req, res) => {
      const { orderId, reason } = req.body; 
        
      const order = await Order.findById(orderId).populate("delivery");
    
      if (!order) {
        return res.status(404).send("Order not found.");
      }
    
      if (order.delivery.status === "Out for Delivery") {
       res.send("Order cannot be cancelled once out for delivery.");
      }
    
      // Update the order status to cancelled and add the reason
      order.status = "Cancelled";
      order.cancellationReason = reason;
    
      // Optionally, update the delivery status
      if (order.delivery) {
        await Delivery.deleteOne({ _id: order.delivery });
      }
    
      const cancelledOrder = await order.save();
    
      if (!cancelledOrder) {
        return res.send("Failed to cancel the order.");
      }
    
      // Optionally, mark the driver as available again (if applicable)
      const driver = await User.findById(order.delivery.driver);
      if (driver) {
        driver.isAvailable = true;
        await driver.save();
      }
    
      res.send("Order cancelled successfully.");
    })
    
    
    
  };
module.exports=orderController