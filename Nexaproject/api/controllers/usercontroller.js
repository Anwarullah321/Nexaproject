//usercontroller.js
const UserModel = require("../models/User.js");
const AdminUserModels = require("../models/adminUsers.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class userController{
    static SignUp = async (req, res) =>{
        const {email, password, role} = req.body;

        const user = await UserModel.findOne({email:email});
        if(user){
            res.send({"status": "failed", "message": "Email allready exists"});
        }else{
            if(email && password){
                try {
                    const salt = await bcrypt.genSalt(10)
                    const hashPassword = await bcrypt.hash(password, salt);
                    const doc = new UserModel({
                        email: email,
                        password: hashPassword,
                        role: role, 
                    })
                    await doc.save()

                    // for token
                    const saved_user = await UserModel.findOne({email: email})
                    // Generate JWT Token
                    console.log(process.env.JWT_SECRET_KEY);
                    const token = jwt.sign({userID: saved_user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "6d"});

                    res.status(201).send({"status": "success", "message": "User Added Successfully", "token": token, "role": role});
                } catch (error) {
                    console.log(error);
                    res.send({"status": "failed", "message": "Unable to Register"});     
                }
            }else{
                res.send({"status": "failed", "message": "All fields are required"});
            }
        }
    }

// In a controller file, e.g., userController.js




    static Login = async (req, res) => {
        try {
            const {email, password} = req.body;
            if(email && password){
                let user = await UserModel.findOne({email:email});
    
                // If the user is not found in the User collection, try the Adminuser collection
                if (!user) {
                    user = await AdminUserModels.findOne({email:email});
                }
    
                if (user) {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if(isMatch){
                        // for token
                        // Generate JWT Token
                        const token = jwt.sign({userID: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "6d"});
                        res.send({"status": "success", "messege": "Login Success", "token": token, "role": user.role})
                    } else {
                        res.send({"status": "failed", "messege": "Name or Email or Password is not Valid"})
                    }
                } else {
                    res.send({"status": "failed", "messege": "You are not a Registered User"})
                }
            } else {
                res.send({"status": "failed", "message": "All fields are required"});
            }
        } catch (error) {
            console.log(error)
            res.send({"status": "failed", "message": "Unable to Login"});   
        }
    }
    
    
}

module.exports = userController;