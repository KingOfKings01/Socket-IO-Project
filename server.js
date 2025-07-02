const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

io.on("connection", (socket)=>{
  console.log("User connected", socket.id)

  socket.on("chat-message", (message)=>{
    console.log("user",socket.id, "said:",message)
    io.emit("chat-message", {userId: socket.id, message})
  })
})

server.listen(3000, () => {
  console.log("Socket.IO server running on http://localhost:3000");
});