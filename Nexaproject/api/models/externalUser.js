//externalUser.js
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
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
   },
    fileName: String ,
    submittedToEmails: [String],
    submittedByEmail: String 
});

const ExterrnalUserFiles = mongoose.model('externalUserFile', userFileSchema);

module.exports = ExterrnalUserFiles;