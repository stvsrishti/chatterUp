// Import required modules
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import Chat from "./chat.schema.js";
import { connect } from "./db.config.js";

// Express app and configure middleware
export const app = express();
app.use(cors());

// HTTP server using Express app
const server = http.createServer(app);


// Initialize Socket.IO server with custom configurations
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Array to store online users
let onlineUsers = [];

// Event handling for Socket.IO connections
io.on("connection", (socket) => {
  console.log("Connection Made ");

  // Event: User joins
  socket.on("join", async (name) => {
    const oldMessage = await Chat.find();
    onlineUsers.push({ id: socket.id, name });
    //console.log(onlineUsers);
    io.emit("onlineUsers", onlineUsers);
    io.emit("joined", { message: oldMessage, name: name });
  });

  // Event: User typing
  socket.on("typing", () => {
    io.emit("typing", socket.id);
  });

  // Event: User sends a message
  socket.on("sendMessage", async (newMessage) => {
    if (!newMessage.message || !newMessage.name) {
      return;
    }
    const newChat = new Chat({
      name: newMessage.name,
      message: newMessage.message,
      time: new Date(),
    });
    io.emit("newMessage", await newChat.save());
  });

  // Event: User disconnects
  socket.on("disconnect", () => {
    const indexToRemove = onlineUsers.findIndex((user) => user.id == socket.id);
    onlineUsers.splice(indexToRemove, 1);
    io.emit("onlineUsers", onlineUsers);
    console.log("Connection disconnected.");
  });
});

server.listen(3000, () => {
  console.log("App is listening on 3000");
  connect();
});
