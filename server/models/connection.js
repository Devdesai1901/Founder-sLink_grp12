import mongoose from "mongoose";

// Define schema for connection between users (investors and founders)
const connectionSchema = new mongoose.Schema({
    sourceUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    connectedAt: { type: Date, default: Date.now },
});

// Create model for connection
const Connection = mongoose.model("Connection", connectionSchema);
export default Connection;
