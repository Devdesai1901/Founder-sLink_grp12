// server/config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from the environment variables
    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {});

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit with failure if the connection fails
  }
};

export default connectDB;
