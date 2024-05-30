const express = require("express");
const router = express.Router();
const UserController = require("../controllers/adminUserController.js");
const authenticateUser = require("../middlewares/authMiddleware.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
//router.use("/adminUser/create",authenticateUser);
    // For create User
    router.post("/adminUser/create", UserController.User_Create);


    // For get All User Details
    router.get("/adminUser/getAll", UserController.getAll_User_Details);


    // For get SingleUser
    router.get("/adminUser/get/:userId", UserController.Single_User_Detaile);


    // For modify User;
    router.put("/adminUser/modify/:userId", UserController.User_Update);


    // For delete User
    router.delete("/adminUser/delete/:userId", UserController.User_Delete);


module.exports = router; 