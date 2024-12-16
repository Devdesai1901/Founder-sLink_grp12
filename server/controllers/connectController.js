import User from "../models/user.js";
import mongoose from "mongoose";


export const handleConnectionRequest = async (req, res) => {
  const { sourceUserId, targetUserId } = req.body;

  try {
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
      (connection) => connection.userId.toString() === targetUserId || connection.userId.toString() === sourceUserId
    );

    if (existingConnection) {
      return res.status(400).json({ error: "Connection already exists" });
    }

    // Add connection to the source user's connections array
    sourceUser.connections.push({
      userId: targetUserId,
      status: "pending",  // Status is 'pending' until the target user accepts
    });

    // Add connection to the target user's connections array
    targetUser.connections.push({
      userId: sourceUserId,
      status: "pending",  // Status is 'pending' until the source user accepts
    });

    // Save both users with the updated connections arrays
    await sourceUser.save();
    await targetUser.save();

    // Send success response
    return res.status(200).json({ message: "Connection request sent successfully!" });
  } catch (error) {
    console.error("Error handling connection request:", error);
    return res.status(500).json({ error: "An error occurred while sending the connection request" });
  }
};
