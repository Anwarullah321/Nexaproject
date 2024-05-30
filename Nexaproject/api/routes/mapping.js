// mapping.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userMappingService.js");

router.post("/mapping/createUserMapping", async (req, res) => {
    const { externalUserEmail, internalUserEmail } = req.body;
    try {
        await UserController.createUserMapping(externalUserEmail, internalUserEmail);
        res.status(201).send('Mapping created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating mapping');
    }
});

module.exports = router;
