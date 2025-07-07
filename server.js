require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const sequelize = require("./config/database");
const userRouters = require("./routes/userRouter");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

// Middleware
{
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(express.static(path.join(__dirname, "public")));
}

//todo: Set cros
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:3000", "http://localhost:5500"],
  },
});

{
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
  });
  app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
  });
  app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "signin.html"));
  });
  app.get("/{*any}", (req, res) => {
    res.status(404).send("<center><h1>404 Page Not Found</h1></center>");
  });

  app.use("/user", userRouters);
}

const onlineUsers = new Map(); // username => socket.id

//todo socket auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

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

    socket.user = user; // Attach user object to request
    next();
  } catch (error) {
    return next(new Error("Internal Server Error"));
  }
});

io.on("connection", (socket) => {
  const username = socket.user.username;
  onlineUsers.set(username, socket.id);

  // Broadcast to everyone updated online users
  io.emit("online-users", Array.from(onlineUsers.keys()));

  socket.on("chat-message", (message) => {
    console.log("User", socket.user.username, "said:", message);

    // Store on DB

    io.emit("chat-message", { username: socket.user.username, message });
  });
});

(async () => {
  await sequelize.sync({ force: false }); // Sync all models
  server.listen(3000, () => {
    console.log("Socket.IO server running on http://localhost:3000");
  });
})();
