require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const sequelize = require("./config/database");
const userRouters = require("./routes/userRouter");
const socketAuthMiddleware = require("./middleware/socketAuth");

const app = express();
const server = http.createServer(app);

// Middleware
{
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  app.use(express.static(path.join(__dirname, "public")));
}

//todo: Set cros
const io = new Server(server, {cors:{
  origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000", "http://localhost:5500"]
}});

{
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
  });
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  });
  app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signin.html'));
  });
  app.get("/{*any}", (req, res) => {
    res.status(404).send("<center><h1>404 Page Not Found</h1></center>")
  });
  
  app.use("/user",userRouters)
}

//todo: auth middleware attach to socket.io connection
io.use(socketAuthMiddleware)

io.on("connection", (socket) => {
  const username = socket.user.username
  // socket.broadcast.emit("chat-message", {username, message:"Hello there"})

  socket.on("chat-message", (message) => {
    console.log(username, "said:", message);
    io.emit("chat-message", { userId: socket.id, message });
  });
});

(async () => {
    await sequelize.sync({ force: false }); // Sync all models
    server.listen(3000, () => {
      console.log("Socket.IO server running on http://localhost:3000");
    });
})();

