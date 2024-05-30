//adminUserController.js
const AdminUserModels = require("../models/adminUsers.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Add User
const User_Create = async (req, res) => {
    const {email, password, role} = req.body;

    const Adminuser = await AdminUserModels.findOne({email:email});
    if(Adminuser){
        res.send({"status": "failed", "message": "Email allready exists"});
    }else{
        if(email && password && role){
            try {
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(password, salt);
                const doc = new AdminUserModels({
                    email: email,
                    password: hashPassword,
                    role: role
                })
                await doc.save()
                const saved_user = await AdminUserModels.findOne({email: email})
      
                res.status(201).send({"status": "success", "message": "User Added Successfully", "role": role});
            } catch (error) {
                console.log(error);
                res.send({"status": "failed", "message": "Unable to Create"});     
            }
        }else{
            res.send({"status": "failed", "message": "All fields are required"});
        }
    }
}

// Get All User Details
const getAll_User_Details = async (req, res) => {
    try {
        const userData = await AdminUserModels.find();
        if(!userData){
            res.status(404).json({ message: "User not found"});
        }
        return res.status(200).json(userData)

    } catch (error) {
        res.status(500).json(err.message || "Something Went Wrong");
    }
}

// Get Sigle User Details
const Single_User_Detaile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userExist = await AdminUserModels.findById(userId);
        
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json( userExist );

    } catch (error) {
        console.error(error);
        res.status(500).json(err.message || "Something Went Wrong");
    }
}

// Update User
    const User_Update = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userExist = await AdminUserModels.findById(userId);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash the password if it's provided in the request body
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
        }

        const updatedData = await AdminUserModels.findByIdAndUpdate(userId, req.body, { new: true });
        if (!updatedData) {
            return res.status(404).json({ message: "User not found or update failed" });
        }
        res.status(200).json({ message: "User updated successfully", updatedData });
    } catch (error) {
        res.status(500).json(err.message || "Something Went Wrong");
    }
};


// Delete User
const User_Delete = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userExist = await AdminUserModels.findById(userId);
        if(!userExist){
            return res.status(404).json({ message: "User not found" });
        }

        await AdminUserModels.findByIdAndDelete(userId);
        res.status(200).json({ message: "User Deleted Successfully"})
    } catch (error) {
        res.status(500).json(err.message || "Something Went Wrong"); 
    }
}
module.exports = {
    User_Create,
    getAll_User_Details,
    Single_User_Detaile,
    User_Update,
    User_Delete,
};