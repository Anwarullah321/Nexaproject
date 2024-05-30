const express = require("express");
const router = express.Router();
const UserController = require("../controllers/usercontroller.js");

// Public Routes
router.post("/signup", UserController.SignUp);
router.post("/login", UserController.Login);

module.exports = router;   