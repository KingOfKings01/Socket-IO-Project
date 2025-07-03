// const { User } = require("../relations/Relation");
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  try {
    
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
      .status(401)
      .json({ message: "Authorization token is missing" });
    }
    
    const decoded = User.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    // const user = await User.findByPk(decoded.id);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
