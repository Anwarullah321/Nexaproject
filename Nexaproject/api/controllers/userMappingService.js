// userMappingService.js
const UserMapping = require('../models/userMapping.js');

const createUserMapping = async (externalUserEmail, internalUserEmail) => {
    console.log(`Received externalUserEmail: ${externalUserEmail}`);
    console.log(`Received internalUserEmail: ${internalUserEmail}`);

    // Ensure both emails are strings
    if (typeof externalUserEmail !== 'string' || typeof internalUserEmail !== 'string') {
        console.error('Both externalUserEmail and internalUserEmail must be strings');
        return; // Exit function if either is not a string
    }

    try {
          // Check if an association already exists
    const existingMapping = await userMapping.findOne({
        externalUserEmail: externalUserEmail,
        internalUserEmail: internalUserEmail
      });
  
      // If no existing mapping is found, create a new one
      if (!existingMapping) {
        const newMapping = new userMapping({
          externalUserEmail: externalUserEmail,
          internalUserEmail: internalUserEmail
        });
  
        await newMapping.save();
        console.log('New mapping created successfully:', newMapping);
        return newMapping;
      } else {
        console.log('Association already exists:', existingMapping);
        return existingMapping;
      }
    } catch (error) {
        console.error(`Error creating mapping for external user: ${externalUserEmail}`, error);
    }
};

   

module.exports = {
 createUserMapping,
};
