const express = require("express");
const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const { cloudinary, upload } = require("../middlewares/cloudinary");

const restaurantController = {
    display: asyncHandler(async (req, res) => {
        const restaurants = await Restaurant.find().populate("menu");
        res.send(restaurants);
    }),

    add: asyncHandler(async (req, res) => {
        const { name, location, rating, image, contact, cuisine, opening_time, closing_time,address } = req.body;

        // Check if the restaurant already exists
        const itemExist = await Restaurant.findOne({ $and: [{ owner: req.user.id, name }] });

        if (itemExist) {
            throw new Error("Restaurant already exists");
        }
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        
        // Encode address for URL
        const encodedAddress = encodeURIComponent(address);
        
        // Google Maps URL format for directions from current location
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
        
        // Create new restaurant
        const newItem = await Restaurant.create({
            name,
            location,
            rating,
            googleMapsUrl,
            image: req.file.path,
            contact,
            cuisine,
            opening_time,
            closing_time,
            address,
            owner: req.user.id
        });

        if (!newItem) {
            throw new Error("Creation failed");
        }

        res.send("New Restaurant added successfully");
    }),

    edit: asyncHandler(async (req, res) => {
        const { name, location, rating, image, contact, cuisine, opening_time, closing_time,address } = req.body;

        // Find restaurant by name and owner
        const restaurant = await Restaurant.findOne({ name, owner: req.user.id });

        if (!restaurant) {
            throw new Error("Restaurant not found or unauthorized");
        }

        // Update restaurant details
        restaurant.name = name || restaurant.name;
        restaurant.location = location || restaurant.location;
        restaurant.rating = rating || restaurant.rating;
        restaurant.image = image || restaurant.image;
        restaurant.contact = contact || restaurant.contact;
        restaurant.cuisine = cuisine || restaurant.cuisine;
        restaurant.opening_time = opening_time || restaurant.opening_time;
        restaurant.closing_time = closing_time || restaurant.closing_time;
        restaurant.address = address || restaurant.address;

        // Save updated restaurant
        const updatedRestaurant = await restaurant.save();

        res.send({
            message: "Restaurant updated successfully",
            restaurant: updatedRestaurant
        });
    }),

    delete: asyncHandler(async (req, res) => {
        const { name } = req.body;

        // Find restaurant by name and owner
        const restaurant = await Restaurant.findOne({ name, owner: req.user.id });

        if (!restaurant) {
            throw new Error("Restaurant not found or unauthorized");
        }

        // Delete restaurant
        await restaurant.deleteOne();

        res.send("Restaurant deleted successfully");
    }),

    search: asyncHandler(async (req, res) => {
        const { keyword, location, cuisine } = req.body;
        const searchCriteria = {};

        // Build search criteria based on provided filters
        if (keyword) {
            searchCriteria.name = { $regex: keyword, $options: "i" };
        }
        if (location) {
            searchCriteria.location = { $regex: location, $options: "i" };
        }
        if (cuisine) {
            searchCriteria.cuisine = { $in: cuisine };  // Searching for any cuisine from the array
        }

        // Search restaurants based on criteria
        const restaurants = await Restaurant.find(searchCriteria).populate("menu");

        if (restaurants.length === 0) {
            res.send("No restaurants found matching the search criteria.");
        }

        res.send(restaurants);
    }),
    view:asyncHandler(async (req, res) => {
        const { name}=req.body
        const restaurants = await Restaurant.find({name}).populate("menu").populate("reviews");
        res.send(restaurants);
    }),
    direction:asyncHandler(async (req, res) => {
        const { lat, lng } = req.body;
        if (!lat || !lng) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }
        // Encode address for URL
        const destination = `${lat},${lng}`;
        
        // Google Maps URL format for directions from current location
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
        
        res.send(googleMapsUrl);
    })
};

module.exports = restaurantController;
