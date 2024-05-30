//internalUserRoutes.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/internalUserController.js");
const upload = require('../middlewares/multer.js');
const authMiddleware = require('../middlewares/authMiddleware'); // Adjust the path as necessary

    router.post('/internalUser/uploadFile',authMiddleware, upload.single('file'),
    (req, res, next) => {
        if (req.fileValidationError) {
           return res.status(400).send(req.fileValidationError);
        }
        next();
       }, UserController.uploadFileToCloudinary);

    router.get("/internalUser/getAllFiles",authMiddleware,UserController.getAllFiles);

    router.get('/internalUser/getAllExternalUserEmails', UserController.getAllExternalUserEmails);

    router.delete('/internalUser/delete/:publicId', UserController.deleteUserFile);

    router.get('/internalUser/getUploadedFile/:publicId', UserController.getUploadedFile);
    router.get('/internalUser/getEmail', authMiddleware, UserController.getInternalUserEmail);
    router.put('/api/internalUser/updateFileStatus/:publicId', UserController.updateFileStatus);

module.exports = router;