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

dotenv.config();

// Create Express app
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Connect to the database
connectDB();

// Middleware for sessions
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: 'sessionId', // Session ID name
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
    return res.redirect("/investor");
  }
  if (req.originalUrl === "/" && req.session.user && req.session.user.userType === "founder") {
    return res.redirect("/founder");
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

app.use('/signup', (req, res, next) => {
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

app.use('/signoutuser', (req, res, next) => {
  if (req.method === "GET") {
    if (!req.session.user) {
      return res.redirect("/signin");
    }
    next();
  } else {
    next();
  }
});

// Import authentication routes
app.use(authRoutes);

// Setup routes (other routes for your application)
configRoutes(app);

// Socket.io setup for real-time communication
const server = http.createServer(app);
const io = new Server(server);
const usp = io.of("/user-namespace");

let userSocketMap = {};

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
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
