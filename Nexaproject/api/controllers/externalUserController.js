//externalUserController.js
const ExterrnalUserFiles = require('../models/externalUser.js');
InternalUserFiles = require('../models/internalUser.js');
const cloudinary = require('../middlewares/cloudinary.js');
const upload = require('../middlewares/multer.js');
const userMapping = require('../models/userMapping.js');
const { estimatedDocumentCount } = require('../models/adminUsers.js');


const uploadFileToCloudinary = async (req, res) => {
    try {
      const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
      const newUserFile = new UserFile({
        imageUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        name: req.body.name, // Name of the sender
            fileName: req.file.originalname // Assuming fileName is the original name of the file
      });
      await newUserFile.save();
      return res.status(200).json({
        success: true,
        message: 'Uploaded',
        data: cloudinaryResult,
        email: req.body.name
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Error',
      });
    }
  };


// externalUserController.js
async function getInternalUserEmailForExternalUser(externalUserEmail) {
  try {
      // Query the UserMapping model to find the internal user's email based on the external user's email
      console.log(`Searching for mapping with email: ${externalUserEmail}`);
      const mapping = await userMapping.findOne({ externalUserEmail: externalUserEmail});
      console.log(`Found mapping:`, mapping);
  
      if (!mapping) {
        throw new Error('No mapping found for the provided external user email');
      }
     // const internalUserEmails = mappings.map(mapping => mapping.internalUserEmail);
      // Return the internal user's email
      return mapping.internalUserEmail;
  } catch (error) {
      console.error('Error fetching internal user email:', error);
      throw error; // Rethrow the error to be handled by the calling function
  }
 }
 


 const getAllFiles = async (req, res) => {
  try {
    const userEmail = req.user.email; // This is the external user's email
    console.log('userEmail is: ', userEmail);

    // Fetch all unique mappings for the external user
    const mappings = await userMapping.find({ externalUserEmail: userEmail }).distinct('internalUserEmail');
    console.log('Found mappings:', mappings);

    // Fetch all files submitted to the internal users
    let allFiles = [];
    for (const email of mappings) {
      console.log('Querying InternalUserFiles for', userEmail);
     let files = await InternalUserFiles.find({ submittedByEmail: email, submittedToEmails: userEmail  }).or([{ status: { $ne: 'deleted' } }, { status: 'deleted' }]);;
      console.log(`Found ${files.length} files for internal user email ${email}`);
      console.log('InternalUserFiles query result:', files);
  // If no files are found in InternalUserFiles, fetch from ExternalUserFiles
  
    console.log('Querying ExternalUserFiles for', userEmail);
    files = await ExterrnalUserFiles.find({submittedByEmail: email, submittedToEmails: { $regex: new RegExp(userEmail) } });
    console.log(`Found ${files.length} files for internal user email ${userEmail}`);
    console.log('ExternalUserFiles query result:', files);


 
  //files = files.filter(file => file.status !== 'deleted');
      // Ensure each file is uniquely associated with its corresponding internal user's email
      files.forEach(file => {
        const existingFileIndex = allFiles.findIndex(f => f.publicId === file.publicId);
        if (existingFileIndex === -1) {
          allFiles.push({
            ...file._doc,
            internalUserName: email, // Ensure correct association
          });
        }
      });
    }

    console.log('All files:', allFiles);

    if (!allFiles || allFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No files found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Successfully retrieved all files",
        data: allFiles,
      
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while getting the files",
      error: error.toString(), // Log the error object
    });
  }
};

 

 
const deleteUserFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    const imageToDelete = await ExterrnalUserFiles.findOne({ publicId });

    if (!imageToDelete) {
      return res.status(404).json({
        success: false,
        message: "file not found"
      });
    }




    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(imageToDelete.publicId);
    // Delete the image document from MongoDB
    await ExterrnalUserFiles.deleteOne({ publicId });
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

 
 

  const getUploadedFile = async (req, res) => {
    try {
      const { publicId } = req.params;
      console.log("Received publicId:", publicId);
  
      const fileToShow = await UserFile.findOne({ publicId: publicId }); // Change this line
  
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


  const approveFile = async (req, res) => {
    try {
       const { publicId } = req.params;
       console.log("Approving file with publicId:", publicId);
   
       // Update status in external user collection
       const fileToUpdateExternal = await ExterrnalUserFiles.findOne({ publicId });
       if (!fileToUpdateExternal) {
         return res.status(404).json({
           success: false,
           message: "File not found in external user collection",
         });
       }

       // Check if the status has already been set
    if (fileToUpdateExternal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "File status cannot be changed once it's set",
      });
    }
       fileToUpdateExternal.status = 'approved';
       await fileToUpdateExternal.save();
   
       // Update status in internal user collection
       const fileToUpdateInternal = await InternalUserFiles.findOne({ publicId });
       if (!fileToUpdateInternal) {
         return res.status(404).json({
           success: false,
           message: "File not found in internal user collection",
         });
       }
       fileToUpdateInternal.status = 'approved';
       await fileToUpdateInternal.save();
   
  // Check if the status has already been set
 

       return res.status(200).json({
         success: true,
         message: "File approved successfully",
         data: fileToUpdateExternal,
       });
    } catch (error) {
       console.error(error);
       return res.status(500).json({
         success: false,
         message: "An error occurred while approving the file",
       });
    }
   };
   


   const rejectFile = async (req, res) => {
    try {
       const { publicId } = req.params;
       console.log("Approving file with publicId:", publicId);
   
       // Update status in external user collection
       const fileToUpdateExternal = await ExterrnalUserFiles.findOne({ publicId });
       if (!fileToUpdateExternal) {
         return res.status(404).json({
           success: false,
           message: "File not found in external user collection",
         });
       }

      // Check if the status has already been set
    if (fileToUpdateExternal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "File status cannot be changed once it's set",
      });
    }

       fileToUpdateExternal.status = 'rejected';
       await fileToUpdateExternal.save();
   
       // Update status in internal user collection
       const fileToUpdateInternal = await InternalUserFiles.findOne({ publicId });
       if (!fileToUpdateInternal) {
         return res.status(404).json({
           success: false,
           message: "File not found in internal user collection",
         });
       }


       fileToUpdateInternal.status = 'rejected';
       await fileToUpdateInternal.save();
   


       return res.status(200).json({
         success: true,
         message: "File approved successfully",
         data: fileToUpdateExternal,
       });
    } catch (error) {
       console.error(error);
       return res.status(500).json({
         success: false,
         message: "An error occurred while approving the file",
       });
    }
   };
   

  module.exports = {
    uploadFileToCloudinary,
    getUploadedFile,
    getAllFiles,
    approveFile,
    rejectFile,
    getInternalUserEmailForExternalUser,
    deleteUserFile
};