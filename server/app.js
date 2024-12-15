import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import exphbs from "express-handlebars";
import configRoutes from "./routes/index.js";
import { Server } from "socket.io";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import session from "express-session";
import chat from "../server/models/chat.js";
import { ObjectId } from "mongodb";
import User from "./models/user.js";
import cookieParser from "cookie-parser";
// confing for dot file
dotenv.config();

// Create Express app
const app = express();

// Connect to the database
connectDB();

// Middleware to serve static files
// declaring stactic folder and setting handls configs
app.use(cookieParser());
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "AuthenticationState",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: false, // Allow access to the cookie from client-side scripts
    },
  })
);

app.use((req, res, next) => {
  console.log("Session:", req.session);
  next();
});

//SigInSignUp
app.use("/", (req, res, next) => {
  let authstate = req.session.user
    ? "Authenticated User"
    : "Non-Authenticated User";
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${
      req.originalUrl
    } (${authstate})`
  );
  if (
    req.originalUrl === "/" &&
    req.session.user &&
    req.session.user.userType === "investor"
  ) {
    return res.redirect("/investor");
  }
  if (
    req.originalUrl === "/" &&
    req.session.user &&
    req.session.user.userType === "founder"
  ) {
    return res.redirect("/founder");
  }
  if (req.originalUrl === "/" && !req.session.user) {
    return res.redirect("/signin");
  }
  if (req.originalUrl !== "/") {
    next();
  }
});
app.use("/signin", (req, res, next) => {
  if (req.method === "GET") {
    if (req.session.user && req.session.user.userType === "investor") {
      return res.redirect("/investor");
    }
    if (req.session.user && req.session.user.userType === "founder") {
      return res.redirect("/founder");
    }
    next();
  } else {
    next();
  }
});
app.use("/signup", (req, res, next) => {
  if (req.method === "GET") {
    if (req.session.user && req.session.user.userType === "investor") {
      return res.redirect("/investor");
    }
    if (req.session.user && req.session.user.userType === "founder") {
      return res.redirect("/founder");
    }
    next();
  } else {
    next();
  }
});
app.use("/signoutuser", (req, res, next) => {
  if (req.method === "GET") {
    if (!req.session.user) {
      return res.redirect("/signin");
    }

    if (req.session.user) {
      next();
    }
  } else {
    next();
  }
});

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
app.use(authRoutes);
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
