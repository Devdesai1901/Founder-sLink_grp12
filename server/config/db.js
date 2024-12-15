// server/config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from the environment variables
    // console.log("MONGO_URI: ",process.env.MONGO_URI);
    // if (!process.env.MONGO_URI) {
    //   throw new Error("MongoDB URI is not defined in the environment variables");
    // }

    await mongoose.connect('mongodb://localhost:27017/founderslink', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });


    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit with failure if the connection fails
  }
};

export default connectDB;
