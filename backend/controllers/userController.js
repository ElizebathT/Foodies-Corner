const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler=require("express-async-handler")
const express=require('express')
const nodemailer = require("nodemailer");
require("dotenv").config()

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER, // Your email
//         pass: process.env.EMAIL_PASS  // App password (not actual email password)
//     }
// });

const userController={
    register : asyncHandler(async(req,res)=>{        
      const {username,email,password,role,phone,address,vehicle,adhar,license,exp}=req.body
      const userExits=await User.findOne({email})
      if(userExits){
          throw new Error("User already exists")
      }
      const hashed_password=await bcrypt.hash(password,10)
    //   const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

      const userCreated=await User.create({
          username,
          email,
          password:hashed_password,
          verified: false,
          role,
        //   verificationToken,
          phone,address,vehicle,adhar,license,exp
      })
      if(!userCreated){
          throw new Error("User creation failed")
      }
      const payload={
          email:userCreated.email,
          id:userCreated.id
      }
      const token=jwt.sign(payload,process.env.JWT_SECRET_KEY)
      
    //   const verificationLink = `${process.env.CLIENT_URL}/verify?token=${verificationToken}`;
    //     await transporter.sendMail({
    //         from: process.env.EMAIL_USER,
    //         to: email,
    //         subject: "Verify Your Email",
    //         html: `<p>Click the link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`
    //     });
      res.json({token,role})
  }),
  
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Send Email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        text: `Click on this link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Email could not be sent" });
        }
        res.json({ message: "Reset link sent to your email" });
    });
}),

// Reset Password - Verifies Token & Updates Password
resetPassword: asyncHandler(async (req, res) => {
    const { email, token, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.resetPasswordToken) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid || user.resetPasswordExpires < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
}),

verifyEmail: asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new Error("Invalid or missing token");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            throw new Error("User not found");
        }

        if (user.verified) {
            return res.send("Email already verified");
        }

        user.verified = true;
        user.verificationToken = null;
        await user.save();

        res.send("Email verification successful");
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}),

  googleRegister : asyncHandler(async(req,res)=>{        
    const email=req.user.emails[0].value
    const userExits=await User.findOne({email})
    if(!userExits){
        
    const userCreated=await User.create({        
        email,
        username:email,
        verified:true
    })
    if(!userCreated){
        throw new Error("User creation failed")
    }
    const payload={
        email:userCreated.email,
        id:userCreated.id
        
    }
    const token=jwt.sign(payload,process.env.JWT_SECRET_KEY)
    res.cookie("token",token,{
        maxAge:2*24*60*60*1000,
        http:true,
        sameSite:"none",
        secure:false
    })
}
    res.send("User created successfully")
}),
    login :asyncHandler(async(req,res)=>{
    const {email,password}=req.body
    const userExist=await User.findOne({email})
    if(!userExist){
        throw new Error("User not found")
    }
    if (!userExist.verified) {
        throw new Error("Please verify your email before logging in");
    }
    const passwordMatch = await bcrypt.compare(password, userExist.password);

    if(!passwordMatch){
        throw new Error("Passwords not matching")
    }
    const payload={
        email:userExist.email,
        id:userExist.id
    }
    const token=jwt.sign(payload,process.env.JWT_SECRET_KEY)
    const role=userExist.role   
    res.json({token,role})
    }),
logout:asyncHandler(async(req,res)=>{
    res.clearCookie("token")
    res.send("User logged out")
    }),
profile:asyncHandler(async (req, res) => {
        const { username, password, address, role, dietaryPreferences, allergies } = req.body;
        const { userId } = req.user.id; 
        const user = await User.findOne({id:userId});
        if (!user) {
            throw new Error("User not found");
        }
    
        
        let hashed_password = user.password; 
        if (password) {
            hashed_password = await bcrypt.hash(password, 10);
        }
    
        user.username = username || user.username;
        user.password = hashed_password;
        user.address = address || user.address;
        user.role = role || user.role;
        user.dietaryPreferences = dietaryPreferences || user.dietaryPreferences;
        user.allergies = allergies || user.allergies;
    
        const updatedUser = await user.save();
    
        if(!updatedUser){
            res.send('Error in updating')
        }
        res.send(user);
    }),

    getUserProfile : asyncHandler(async (req, res) => {
        const userId = req.user.id; 
    
        const user = await User.findById(userId).select("-password"); 
        if (!user) {
            throw new Error("User not found");
        }
    
        res.send({
            message: "User details retrieved successfully",
            user
        });
    }),

    changePassword: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
    
        // Validate input
        if (!oldPassword || !newPassword) {
            res.status(400);
            throw new Error("Both old and new passwords are required");
        }
    
        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
    
        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(401);
            throw new Error("Incorrect old password");
        }
    
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
    
        // Save the updated user
        await user.save();
    
        res.send({
            message: "Password changed successfully",
        });
    })

}
module.exports=userController
