import express from "express";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import exphbs from "express-handlebars";
import configRoutes from "./routes/index.js";
import { Server } from "socket.io";
import http from "http";
import User from "../server/models/user.js";
import chat from "../server/models/chat.js";
import { ObjectId } from "mongodb";

// confing for dot file
dotenv.config();

// conecting server and database
const app = express();
connectDB();

// const rewriteUnsupportedBrowserMethods = (req, res, next) => {
//   if (req.body && req.body._method) {
//     req.method = req.body._method;
//     delete req.body._method;
//   }
//   next();
// };

// declaring stactic folder and setting handls configs
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(rewriteUnsupportedBrowserMethods);
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

// config routes
configRoutes(app);

// setting Socket.io
const server = http.createServer(app);
const io = new Server(server);
var usp = io.of("/user-namespace");

// code for online offline status update
usp.on("connection", async function (socket) {
  let userId = socket.handshake.auth.token;

  userId = new ObjectId(userId);
  await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });
  userId = userId.toString();
  socket.broadcast.emit("getOnlineUser", { user_id: userId });
  socket.on("disconnect", async function () {
    let userId = socket.handshake.auth.token;
    userId = new ObjectId(userId);
    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "0" } });
    userId = userId.toString();
    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });

  //chat broadcast implemetion
  socket.on("newChat", function (data) {
    socket.broadcast.emit("loadNewChat", data);
  });

  //load old chats
  socket.on("existsChat", async function (data) {
    let oldChats = await chat.find({
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
  console.log("We've now got a server!");
  console.log(`Server running on port ${PORT}`);
});
