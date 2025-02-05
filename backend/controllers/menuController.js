const express = require("express");
const asyncHandler = require("express-async-handler");
const MenuItem = require("../models/menuItemModel");
const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");

const menuController = {
    // Create a new menu item
    createMenuItem: asyncHandler(async (req, res) => {
        const { name, description, price, image, category, restaurantName, availability, discount } = req.body;
        const restaurantExist = await Restaurant.findOne({name: restaurantName});
        
        if(!restaurantExist){
            res.send('Restaurant not found')
        }
    const restaurant=restaurantExist._id
        // Check if the menu item already exists for the given restaurant
        const itemExist = await MenuItem.findOne({ $and: [{ restaurant: restaurant }, { name }] });

        if (itemExist) {
            throw new Error("Menu item already exists in this restaurant");
        }

        // Create new menu item
        const newItem = await MenuItem.create({
            name,
            description,
            price,
            image:req.file.path,
            category,
            restaurant,
            availability: availability || true, 
            discount: discount || { percentage: 0, validUntil: null }
        });

        if (!newItem) {
            throw new Error("Creation failed");
        }

        await Restaurant.findByIdAndUpdate(
            restaurant,
            { $push: { menu: newItem._id } },
            { new: true }
        );

        res.status(201).json({
            message: "New menu item added successfully",
            menuItem: newItem
        });
    }),

    // Get all menu items
    getAllMenuItems: asyncHandler(async (req, res) => {
        const menuItems = await MenuItem.find().populate("restaurant");
        res.json(menuItems);
    }),

    // Get menu items by restaurant ID
    getMenuItemsByRestaurant: asyncHandler(async (req, res) => {
        const {restaurantName } = req.body;
        const restaurantExist = await Restaurant.findOne({name: restaurantName});
        
        if(!restaurantExist){
            res.send('Restaurant not found')
        }
        const restaurant=restaurantExist._id
        const menuItems = await MenuItem.find({ restaurant: restaurant })
        
        if (menuItems.length === 0) {
            return res.send("No menu items found for this restaurant");
        }
        
        res.send(menuItems);
    }),

    // Get a single menu item by ID
    getMenuItemById: asyncHandler(async (req, res) => {
        const {name } = req.body;
        const menuItem = await MenuItem.findOne({name})

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.json(menuItem);
    }),

    // Update a menu item
    updateMenuItem: asyncHandler(async (req, res) => {
        const { name, description, price, image, category, restaurant, availability, discount } = req.body;

        // Find the menu item by ID
        const menuItem = await MenuItem.findOne({name});

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        // Update the fields
        menuItem.name = name || menuItem.name;
        menuItem.description = description || menuItem.description;
        menuItem.price = price || menuItem.price;
        menuItem.image = image || menuItem.image;
        menuItem.category = category || menuItem.category;
        menuItem.restaurant = restaurant || menuItem.restaurant;
        menuItem.availability = availability !== undefined ? availability : menuItem.availability; // Only update if defined
        menuItem.discount = discount || menuItem.discount;

        // Save the updated menu item
        const updatedMenuItem = await menuItem.save();

        res.send({
            message: "Menu item updated successfully",
            menuItem: updatedMenuItem
        });
    }),

    // Delete a menu item
    deleteMenuItem: asyncHandler(async (req, res) => {
        const {name}=req.body
        const { restaurantName } = req.body;
        const restaurantExist = await Restaurant.findOne({name: restaurantName});
        
        if(!restaurantExist){
            res.send('Restaurant not found')
        }
        const restaurant=restaurantExist._id
        const menuItem = await MenuItem.findOne({ $and: [{ restaurant: restaurant }, { name }] });

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        // Delete the menu item
        await menuItem.deleteOne();

        res.json({ message: "Menu item deleted successfully" });
    }),
    filterMenuItems:asyncHandler(async (req, res) => {
          const currentUser = req.user; 
          const { dietaryPreferences, allergies } = await User.findOne({_id:currentUser.id});
          const { category, priceMin, priceMax } = req.body;
          let filterQuery = {};
          if (dietaryPreferences && dietaryPreferences.length > 0) {
            filterQuery.dietaryRestrictions = { $in: dietaryPreferences };
        }
        if (allergies && allergies.length > 0) {
            filterQuery.name = { $nin: allergies };
        }
          if (category) {
            filterQuery.category = category;
          }
          if (priceMin || priceMax) {
            filterQuery.price = {};
            if (priceMin) filterQuery.price.$gte = priceMin;
            if (priceMax) filterQuery.price.$lte = priceMax;
          }
          const filteredMenuItems = await MenuItem.find(filterQuery);
      
          if (!filteredMenuItems) {
            res.send({ message: "No menu items found matching your criteria" });
          }
      
         res.send({ menuItems: filteredMenuItems });
        
      })
};

module.exports = menuController;
