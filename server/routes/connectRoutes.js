import express from "express";
import User from "../models/user.js";

const router = express.Router();

// POST /connect - Handle connection requests
router.post("/connect", async (req, res) => {
    const { sourceUserId, targetUserId } = req.body;

    try {
        // Ensure both users exist
        const sourceUser = await User.findById(sourceUserId);
        const targetUser = await User.findById(targetUserId);

        if (!sourceUser || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already connected
        if (sourceUser.connections.includes(targetUserId)) {
            return res.status(400).json({ message: "Already connected" });
        }

        // Update connections for both users
        sourceUser.connections.push(targetUserId);
        await sourceUser.save();

        targetUser.connections.push(sourceUserId);
        await targetUser.save();

        return res.status(200).json({ message: "Connection successful" });
    } catch (error) {
        console.error("Error handling connection request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
