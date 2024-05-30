// internalUser.js
const mongoose = require('mongoose');

const userFileSchema = new mongoose.Schema({
    pdfUrl: {
        type: String,
    },
    publicId: String,
    name: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'deleted'],
      default: 'pending'
   },
    fileName: String,// Keep this for file name
    submittedToEmails: [String],
    submittedByEmail: String
});

const InternalUserFiles = mongoose.model('internalUserFile', userFileSchema);

module.exports = InternalUserFiles;
