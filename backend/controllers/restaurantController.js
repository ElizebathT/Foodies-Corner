const express = require("express");
const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/restaurantModel");
const MenuItem = require("../models/menuItemModel");
const { cloudinary, upload } = require("../middlewares/cloudinary");
const Order = require("../models/orderModel");
const Delivery = require("../models/deliveryModel");
const Cart = require("../models/cartModel");
const Complaint = require("../models/complaintModel");
const Review = require("../models/reviewModel");

const restaurantController = {
    display: asyncHandler(async (req, res) => {
        const restaurants = await Restaurant.find({ verified: true }).populate("menu");
        res.send(restaurants);
    }),

    add: asyncHandler(async (req, res) => {
        const { name, location, contact, cuisine, opening_hours, address, license, fssai, gst, trade_license } = req.body;

        const itemExist = await Restaurant.findOne({ owner: req.user.id, name });
        if (itemExist) {
            throw new Error("Restaurant already exists");
        }

        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        const encodedAddress = encodeURIComponent(address);
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;

        const newItem = await Restaurant.create({
            name,
            location,
            googleMapsUrl,
            image: req.file?.path || "",
            contact,
            cuisine,
            opening_hours,
            address,
            owner: req.user.id,
            verified: false, // By default, a new restaurant is not verified
            license,
            fssai,
            gst,
            trade_license,
        });

        if (!newItem) {
            throw new Error("Creation failed");
        }

        res.send("New Restaurant added successfully, pending verification.");
    }),

    edit: asyncHandler(async (req, res) => {
        const { name, location, image, contact, cuisine, opening_hours, address, license, fssai, gst, trade_license } = req.body;

        // Find restaurant by name and owner
        const restaurant = await Restaurant.findOne({ name, owner: req.user.id, verified: true });

        if (!restaurant) {
            throw new Error("Restaurant not found or unauthorized");
        }

        // Update restaurant details
        restaurant.name = name || restaurant.name;
        restaurant.location = location || restaurant.location;
        restaurant.image = image || restaurant.image;
        restaurant.contact = contact || restaurant.contact;
        restaurant.cuisine = cuisine || restaurant.cuisine;
        restaurant.opening_hours = opening_hours || restaurant.opening_hours;
        restaurant.address = address || restaurant.address;
        restaurant.license = license || restaurant.license;
        restaurant.fssai = fssai || restaurant.fssai;
        restaurant.gst = gst || restaurant.gst;
        restaurant.trade_license = trade_license || restaurant.trade_license;

        // Save updated restaurant
        const updatedRestaurant = await restaurant.save();

        res.send({
            message: "Restaurant updated successfully",
            restaurant: updatedRestaurant,
        });
    }),

    delete: asyncHandler(async (req, res) => {
        const { name } = req.body;

        // Find restaurant by name and owner
        const restaurant = await Restaurant.findOne({ name, owner: req.user.id });

        if (!restaurant) {
            throw new Error("Restaurant not found or unauthorized");
        }

        const restaurantId = restaurant._id;
        await Promise.all([
            MenuItem.deleteMany({ restaurant: restaurantId }),
            Order.deleteMany({ restaurant: restaurantId }),
            Complaint.deleteMany({ restaurant: restaurantId }),
            Review.deleteMany({ restaurant: restaurantId }),
            Delivery.deleteMany({ order: { $in: await Order.find({ restaurant: restaurantId }).distinct("_id") } }),
            Cart.deleteMany({ "items.menuItem": { $in: await MenuItem.find({ restaurant: restaurantId }).distinct("_id") } }),
        ]);

        // Finally, delete the restaurant
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
            searchCriteria.cuisine = { $in: cuisine.split(",") };
        }

        // Search restaurants based on criteria
        const restaurants = await Restaurant.find({ ...searchCriteria, verified: true })
            .select("name location cuisine contact")
            .populate("menu");

        if (restaurants.length === 0) {
            return res.send("No restaurants found matching the search criteria.");
        }

        res.send(restaurants);
    }),

    view: asyncHandler(async (req, res) => {
        const { name } = req.body;
        const restaurants = await Restaurant.find({ name }).populate("menu").populate("reviews");
        res.send(restaurants);
    }),

    direction: asyncHandler(async (req, res) => {
        const { lat, lng } = req.body;
        if (!lat || !lng) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }

        // Encode address for URL
        const destination = `${lat},${lng}`;

        // Google Maps URL format for directions from current location
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;

        res.send(googleMapsUrl);
    }),
};

module.exports = restaurantController;
