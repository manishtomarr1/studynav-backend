// auth.js

import jwt from 'jsonwebtoken';

export const authenticateAdmin = (req, res, next) => {
    console.log('Auth middleware reached');
    const token = req.header('Authorization');
  
  console.log(token, "header>>>>>>>>>>>>>>>>>>>>>>>>")

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.jwtSecretKey);
    console.log('Decoded:', decoded); // Add this line
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};
