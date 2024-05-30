// authMiddleware.js
const jwt = require('jsonwebtoken');
const UserModel = require("../models/adminUsers.js");


const authenticateUser = (req) => {
   console.log('Authorization Header:', req.headers.authorization); 
   if (!req.headers.authorization) {
       return res.status(401).json({ message: 'No token provided' });
   }
 const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is sent as 'Bearer <token>'
 console.log('Token:', token);
 
 if (!token) return null;

 try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Use your actual JWT secret
    console.log('Decoded:', decoded);
    return decoded;
 } catch (error) {
    console.error('JWT verification error:', error);
    return null;
 }
};

const authMiddleware = async (req, res, next) => {
    console.log('Auth middleware called'); 
 const user = authenticateUser(req);
 console.log('User:', user); 
 if (user) {
    // Fetch the user's email from the database using the userID
    const userFromDb = await UserModel.findById(user.userID); 
    console.log('userFromDB: ',userFromDb);
    if (!userFromDb) {
        return res.status(401).json({ message: 'User not found' });
    }
    // Attach the user's email to req.user
    req.user = {
        ...user,
        email: userFromDb.email // Assuming the user document has an 'email' field
    };
   
    next();
 } else {
    res.status(401).json({ message: 'Unauthorized' });
 }
};

module.exports = authMiddleware;
