import User from "../models/user.js";
import mongoose from "mongoose";

// Handle the connection request
export const handleConnectionRequest = async (req, res) => {
  const { sourceUserId, targetUserId } = req.body;

  try {
    // Validate the IDs
    if (!mongoose.Types.ObjectId.isValid(sourceUserId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: "Invalid user ID(s)" });
    }

    // Check if both users exist
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

    // Add connection to both users' connection arrays with status "accepted"
    sourceUser.connections.push({
      userId: targetUserId,
      status: "accepted",  // Set status to "accepted"
    });

    targetUser.connections.push({
      userId: sourceUserId,
      status: "accepted",  // Set status to "accepted"
    });

    // Save both users with the updated connections arrays
    await sourceUser.save();
    await targetUser.save();

    // Send success response
    return res.status(200).json({ message: "You are now connected!" });
  } catch (error) {
    console.error("Error handling connection request:", error);
    return res.status(500).json({ error: "An error occurred while sending the connection request" });
  }
};
