 //externalUserRoutes.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/externalUserController.js");
const upload = require('../middlewares/multer.js');
const authMiddleware = require('../middlewares/authMiddleware'); // Adjust the path as necessary

    router.post('/external/uploadFile',upload.single('image'), UserController.uploadFileToCloudinary);

    router.get("/external/getAllFiles", authMiddleware, UserController.getAllFiles);
// Assuming you're using Express.js for routing
//router.get('/external/getAllFiles/:email', UserController.getAllFiles);

    router.get('/external/getUploadedFile/:publicId', UserController.getUploadedFile);
    router.delete('/external/delete/:publicId',authMiddleware, UserController.deleteUserFile);
    router.put("/external/approveFile/:publicId",authMiddleware, UserController.approveFile);

    router.put("/external/rejectFile/:publicId", UserController.rejectFile);
   
module.exports = router;