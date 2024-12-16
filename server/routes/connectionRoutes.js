import express from "express";
import User from "../models/user.js";

const router = express.Router();

// Endpoint to handle the connection request
router.post("/connect", async (req, res) => {
  const { sourceUserId, targetUserId } = req.body;

  try {
    const sourceUser = await User.findById(sourceUserId);
    const targetUser = await User.findById(targetUserId);

    if (!sourceUser || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the connection already exists
    const existingConnection = sourceUser.connections.find(
      (connection) => connection.userId.toString() === targetUserId
    );

    if (existingConnection) {
      return res.status(400).json({ error: "Connection already exists" });
    }

    // Add connection to both the source and target user
    sourceUser.connections.push({ userId: targetUserId, status: "pending" });
    targetUser.connections.push({ userId: sourceUserId, status: "pending" });

    await sourceUser.save();
    await targetUser.save();

    // Emit real-time updates to both the source and target users
    req.app.locals.io.of("/user-namespace").to(sourceUserId.toString()).emit("connectionStatusUpdated", {
      message: "Connection request sent!",
      status: "pending",
    });

    req.app.locals.io.of("/user-namespace").to(targetUserId.toString()).emit("connectionStatusUpdated", {
      message: `Investor ${sourceUser.firstName} ${sourceUser.lastName} has connected with you!`,
      status: "pending",
    });

    res.status(200).json({ message: "Connection request sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
