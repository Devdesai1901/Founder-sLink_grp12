import mongoose from "mongoose";

// Define the User schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["founder", "investor"], required: true },
  phoneCode: { type: String, required: true }, // E.g., "+1", "+91"
  phoneNumber: { type: String, required: true },
  bio: { type: String }, // Optional bio
  profilePicture: { type: String }, // Optional URL to profile picture
  is_online: { type: String, default: "0" },
  dateOfBirth: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
export default User;
