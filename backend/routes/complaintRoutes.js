const express = require("express");
const userAuthentication = require("../middlewares/userAuthentication");
const complaintController = require("../controllers/complaintController");
const adminAuthentication = require("../middlewares/admin");

const complaintRouter = express.Router();

complaintRouter.post("/add", userAuthentication, complaintController.fileComplaint);
complaintRouter.get("/get", userAuthentication, complaintController.getUserComplaints);
complaintRouter.get("/restaurants", userAuthentication, complaintController.getRestaurantComplaints);
complaintRouter.get("/viewall", userAuthentication, adminAuthentication,complaintController.getAllComplaints);
complaintRouter.put("/update", userAuthentication, adminAuthentication,complaintController.updateComplaintStatus);

module.exports = complaintRouter;
