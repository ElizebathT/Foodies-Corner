const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/restaurantModel");
const Complaint = require("../models/complaintModel");

const complaintController={
    fileComplaint  : asyncHandler(async (req, res) => {
    const { name, subject, description } = req.body;
    const restaurant=await Restaurant.findOne({name})
    if(!restaurant){
            throw new Error("Restaurant not Found")
        }
    const complaint = new Complaint({
      user: req.user.id, // Extracted from auth middleware
      restaurant:restaurant,
      subject,
      description,
    });
    await complaint.save();
    if(!complaint){
        res.send("Error in filing complaint")
      }
    res.send('Complaint filed successfully');
}),

getAllComplaints :asyncHandler(async (req, res) => {
      const complaints = await Complaint.find().populate('user', 'name').populate('restaurant', 'name');
      if(!complaints){
        res.send("No complaints found")
      }
      res.send(complaints);
  }),

  getUserComplaints :asyncHandler(async (req, res) => {
      const complaints = await Complaint.find({ user: req.user.id }).populate('restaurant', 'name');
      if(!complaints){
        res.send("No complaints found")
      }
      res.send(complaints);
  }),
  getRestaurantComplaints :asyncHandler(async (req, res) => {
      const { name } = req.body;
      const restaurant=await Restaurant.findOne({name})
      const complaints = await Complaint.find({ restaurant }).populate('user', 'name');
      if(!complaints){
        res.send("No complaints found")
      }
      res.send(complaints);
  }),
  updateComplaintStatus :asyncHandler(async (req, res) => {
      const { id, status, response } = req.body;
  
      const complaint = await Complaint.findById(id);
      if (!complaint) throw new Error('Complaint not found');
  
      complaint.status = status|| '';
      complaint.response = response || '';
      await complaint.save();

      res.send({ message: 'Complaint updated successfully', complaint });
  }),
}
module.exports=complaintController