//userMapping.js

const mongoose = require('mongoose');

const UserMappingSchema = new mongoose.Schema({
 externalUserEmail: {
    type: String,
    required: true,
 },
 internalUserEmail: {
    type: String,
    required: true,
 },
 filePublicId: { // Add this field to store the publicId of the uploaded file
    type: String,
    required: true,
 },
});

module.exports = mongoose.model('UserMapping', UserMappingSchema);
