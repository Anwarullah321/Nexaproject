const mongoose = require("mongoose");

// Defining Schema
const userSchema = new mongoose.Schema({
    email: {type: String, required: true, trim: true},
    password: {type: String, required: true, trim: true},
    role: {type: String, required: true, trim: true}
})

// Model
const AdminUserModels = mongoose.model("Adminuser", userSchema);

module.exports = AdminUserModels;