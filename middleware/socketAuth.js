import User from "../models/User.js";

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers["authorization"];

    if (!token) {
      return next(new Error("Authorization token is missing"));
    }

    const decoded = User.verifyToken(token);
    if (!decoded) {
      return next(new Error("Invalid or expired token"));
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user; // Attach the user object to the socket instance
    next(); // Proceed with the next middleware or the socket event
  } catch (error) {
    next(new Error("Internal Server Error"));
  }
};

export default socketAuthMiddleware;
