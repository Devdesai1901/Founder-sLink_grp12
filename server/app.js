import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import exphbs from "express-handlebars";
import configRoutes from "./routes/index.js";
import { Server } from "socket.io";
import http from "http";
import User from "../server/models/user.js";
import chat from "../server/models/chat.js";
import { ObjectId } from "mongodb";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to the database
connectDB();

// Middleware to serve static files
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handlebars view engine setup
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "handlebars",
  helpers: {
    json: (context) => JSON.stringify(context),
    formatDate: (date) => new Date(date).toLocaleDateString(),
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Setup routes
configRoutes(app);

// Set up Socket.io server for real-time communication
const server = http.createServer(app);
const io = new Server(server);
const usp = io.of("/user-namespace");
let userSocketMap = {};

usp.on("connection", async (socket) => {
  let userId = socket.handshake.auth.token;
  userId = new ObjectId(userId);

  await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });
  userId = userId.toString();
  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async () => {
    let userId = socket.handshake.auth.token;
    userId = new ObjectId(userId);
    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "0" } });
    userId = userId.toString();
    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });

  socket.on("newChat", (data) => {
    socket.broadcast.emit("loadNewChat", data);
  });

  socket.on("existsChat", async (data) => {
    const oldChats = await chat.find({
      $or: [
        { sender_id: data.sender_id, receiver_id: data.receiver_id },
        { sender_id: data.receiver_id, receiver_id: data.sender_id },
      ],
    });
    socket.emit("loadChats", { chats: oldChats });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server is running!");
  console.log(`Server running on port ${PORT}`);
});
