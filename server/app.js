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
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import User from "./models/user.js";
import mongoose from "mongoose";
import Connection from "./models/connection.js";

dotenv.config();

// Create Express app
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_COOKIE_NAME = "sessionId";

// Connect to the database
connectDB();

// Middleware for sessions
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: SESSION_COOKIE_NAME,
  secret: 'your-secret-key', // Secret for encrypting session
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set 'secure: true' if you're using https
}));

// Handlebars view engine setup
const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.resolve(__dirname, "views", "layouts"), // Normalized path to prevent duplication
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

// Serve static files (CSS, JS)
app.use("/public", express.static(path.join(__dirname, "public")));

// Middleware to handle route-specific behavior
app.use('/', (req, res, next) => {
  let authstate = req.session.user ? "Authenticated User" : "Non-Authenticated User";
  console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${authstate})`);
  if (req.originalUrl === "/" && req.session.user && req.session.user.userType === "investor") {
    return res.redirect("/investor/dashboard");
  }
  if (req.originalUrl === "/" && req.session.user && req.session.user.userType === "founder") {
    return res.redirect("/founder/dashboard");
  }
  if (req.originalUrl === "/" && !req.session.user) {
    return res.redirect("/signin");
  }
  if (req.originalUrl !== "/") {
    next();
  }
});

app.use('/signin', (req, res, next) => {
  if (req.method === "GET") {
    if (req.session.user && req.session.user.userType === "investor") {
      return res.redirect("/investor/dashboard");
    }
    if (req.session.user && req.session.user.userType === "founder") {
      return res.redirect("/founder/dashboard");
    }
    next();
  } else {
    next();
  }
});

app.use('/signup', (req, res, next) => {
  if (req.method === "GET") {
    if (req.session.user && req.session.user.userType === "investor") {
      return res.redirect("/investor/dashboard");
    }
    if (req.session.user && req.session.user.userType === "founder") {
      return res.redirect("/founder/dashboard");
    }
    next();
  } else {
    next();
  }
});

app.use('/signout', async (req, res) => {
  try {
      req.session.destroy((err) => {
          if (err) {
              console.error("Error destroying session:", err);
              return res.status(500).send("Could not log out.");
          }
          res.clearCookie(SESSION_COOKIE_NAME); 
          console.log("Session cleared and cookie removed.");
          res.redirect('/signin'); 
      });
  } catch (error) {
      console.error("Error during signout:", error);
      res.status(500).send("Internal Server Error.");
  }
});


// Route to handle connection between users
app.post("/connect", async (req, res) => {
  try {
    const sanitizeId = (id) => {
      if (typeof id === "string" && id.startsWith('"') && id.endsWith('"')) {
        return id.slice(1, -1);
      }
      return id;
    };

    const sourceUserId = sanitizeId(req.body.sourceUserId);
    const targetUserId = sanitizeId(req.body.targetUserId);

    if (!mongoose.Types.ObjectId.isValid(sourceUserId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: "Invalid user ID format." });
    }

    const sourceUser = await User.findById(sourceUserId);
    const targetUser = await User.findById(targetUserId);

    if (!sourceUser || !targetUser) {
      return res.status(404).json({ error: "One or both users not found." });
    }

    const existingConnection = await Connection.findOne({ sourceUserId, targetUserId });
    if (existingConnection) {
      return res.status(400).json({ error: "Connection already exists." });
    }

    const newConnection = new Connection({ sourceUserId, targetUserId });
    await newConnection.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("newConnection", { sourceUserId, targetUserId });
    }

    return res.status(200).json({ success: true, message: "Connection successful." });
  } catch (error) {
    console.error("Error connecting users:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});




// Import authentication routes
app.use(authRoutes);

// Setup routes (other routes for your application)
configRoutes(app);

// Socket.io setup for real-time communication
const server = http.createServer(app);
const io = new Server(server);
app.set("io", io); // Store io instance for later use in routes

const usp = io.of("/user-namespace");

usp.on("connection", async (socket) => {
  let userId = socket.handshake.auth.token;
  userId = new ObjectId(userId);

  // Update user status to online
  await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });
  userId = userId.toString();
  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async () => {
    let userId = socket.handshake.auth.token;
    userId = new ObjectId(userId);
    // Update user status to offline
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

  // Handle real-time connection notifications
  socket.on("newConnection", (data) => {
    socket.emit("connectionMade", data);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
