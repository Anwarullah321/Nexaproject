//internalUserController.js
const InternalUserFiles = require('../models/internalUser.js');
const cloudinary = require('../middlewares/cloudinary.js');
const upload = require('../middlewares/multer.js');
const ExterrnalUserFiles = require("../models/externalUser.js")
const UserModel = require("../models/adminUsers.js");
const UserMapping = require('../models/userMapping.js'); 

 // internalUserController.js
 const uploadFileToCloudinary = async (req, res) => {
  try {
     console.log("Request Body:", req.body); 
     // Upload file to Cloudinary
     if (!req.file || !req.file.path) {
       return res.status(400).json({ message: "No file uploaded or file upload failed" });
     }
     const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
     


     
     // Create a new document for the uploaded file
     const newUserFile = new InternalUserFiles({
         pdfUrl: cloudinaryResult.secure_url,
         publicId: cloudinaryResult.public_id,
         submittedByEmail: req.body.internalUserEmail,
         fileName: req.file.originalname,
         submittedToEmails: JSON.parse(req.body.submittedToEmails), // Parse submittedToEmails as an array
     });
     await newUserFile.save();
     const newExternalUserFile = new ExterrnalUserFiles({
      imageUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      name: req.body.name,
      fileName: req.file.originalname,
      internaluserfiles: req.body.internaluserfiles,
      submittedToEmails: req.body.submittedToEmails,
      //senderName: req.body.internalUserEmail // Assuming this is the intended field for senderName in externalUserFiles
      submittedByEmail: req.body.internalUserEmail
    });
  await newExternalUserFile.save();
     // Check if a mapping already exists for the given internal and external user emails
     const externalUserEmails = JSON.parse(req.body.submittedToEmails); // Parse submittedToEmails as an array
     for (const externalUserEmail of externalUserEmails) {
      // Attempt to find an existing mapping
const existingMapping = await UserMapping.findOne({
  externalUserEmail: externalUserEmail,
  internalUserEmail: req.body.internalUserEmail,
  
 });
 

 
       if (existingMapping) {
         // Update the existing mapping with the new file information
         // This could involve updating a reference to the file in the mapping document
         // or updating the mapping document itself, depending on your data model
         existingMapping.filePublicId = cloudinaryResult.public_id;
         await existingMapping.save();
         console.log(`Mapping already exists for internal user ${req.body.internalUserEmail} and external user ${externalUserEmail}. Updating file association.`);
         // Implement your logic to update the existing mapping here
       } else {
         // Create a new mapping and proceed with the file upload
         const newMapping = new UserMapping({
           externalUserEmail: externalUserEmail,
           internalUserEmail: req.body.internalUserEmail,
           filePublicId: cloudinaryResult.public_id,
           // Additional fields as needed
         });
         await newMapping.save();
         console.log(`New mapping created for internal user ${req.body.internalUserEmail} and external user ${externalUserEmail}.`);
       }
     }
 
     // Respond with success message
     return res.status(200).json({
         success: true,
         message: 'Uploaded',
         data: [cloudinaryResult],
         submittedByEmail: req.body.internalUserEmail,
         publicId: cloudinaryResult.public_id, 
     });
  } catch (error) {
       console.error(error);
       // Respond with error message
       return res.status(500).json({
           success: false,
           message: 'Error',
       });
  }
 };
 


// Get All External User Details
const getAllExternalUserEmails = async (req, res) => {
  try {
      // Filter users where the role is 'external'
      const userData = await UserModel.find({ role: 'external' }, { email: 1, _id: 0 });
      if (!userData || userData.length === 0) {
          return res.status(404).json({ message: "No external users found" });
      }
      return res.status(200).json(userData);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong" });
  }
};

// Add this function to your internalUserController.js
const getInternalUserEmail = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
   }
     // Logic to fetch the internal user's email
     // This is a placeholder. You need to implement the actual logic based on how you're handling user sessions or tokens.
     const internalUserEmail = req.user.email; // This should be fetched based on the user's session or token
     console.log("internalUserEmail: ",internalUserEmail);
     return res.status(200).json({
       success: true,
       submittedByEmail: internalUserEmail
     });
  } catch (error) {
     console.error(error);
     return res.status(500).json({
       success: false,
       message: 'Error fetching internal user email',
     });
  }
 };
 

 const getAllFiles = async (req, res) => {
  try {
      
      const userEmail = req.user.email;
        console.log('userEmail is: ',userEmail);
      // Filter files based on the user's email
      const files = await InternalUserFiles.find({ submittedByEmail: userEmail });
      console.log('files are: ',files);
      if (!files || files.length === 0) {
          return res.status(404).json({
              success: false,
              message: "No files found",
          });
      } else {
          return res.status(200).json({
              success: true,
              message: "Successfully retrieved all files",
              data: files,
          });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          success: false,
          message: "An error occurred while getting the files",
      });
  }
};

  const deleteUserFile = async (req, res) => {
    try {
      const { publicId } = req.params;
  
      const imageToDelete = await InternalUserFiles.findOne({ publicId });
  
      if (!imageToDelete) {
        return res.status(404).json({
          success: false,
          message: "file not found"
        });
      }

  // Update the file's status to 'deleted' and remove its association with the internal user
  imageToDelete.status = 'deleted';
  imageToDelete.submittedByEmail = null; // Assuming this is how you track the association
  await imageToDelete.save();


      // Delete the image from Cloudinary
      await cloudinary.uploader.destroy(imageToDelete.publicId);
      // Delete the image document from MongoDB
      await InternalUserFiles.deleteOne({ publicId });
      // Respond with success message
      return res.status(200).json({
        success: true,
        message: "file deleted successfully"
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error in deleting image"
      });
    }
  };
  
// Add this function to your internalUserController.js


  const getUploadedFile = async (req, res) => {
    try {
      const { publicId } = req.params;
      console.log("Received publicId:", publicId);
  
      const fileToShow = await InternalUserFiles.findOne({ publicId: publicId }); // Change this line
  
      if (!fileToShow) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Successfully got user upload file",
          data: fileToShow,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while getting the file",
      });
    }
  };


  const updateFileStatus = async (req, res) => {
    try {
       const { publicId } = req.params;
       const { status } = req.body;
   
       // Find the file by its publicId
       const file = await InternalUserFiles.findOne({ publicId });
   
       if (!file) {
         return res.status(404).json({
           success: false,
           message: "File not found",
         });
       }
   
       // Update the file's status
       file.status = status;
       await file.save();
   
       // Respond with success message
       return res.status(200).json({
         success: true,
         message: "File status updated successfully",
         data: file,
       });
    } catch (error) {
       console.error(error);
       return res.status(500).json({
         success: false,
         message: "Error updating file status",
       });
    }
   };
   

module.exports = {
  uploadFileToCloudinary, 
  getAllFiles, 
  getAllExternalUserEmails,
  getUploadedFile, 
  deleteUserFile,
  getInternalUserEmail,
  updateFileStatus
};