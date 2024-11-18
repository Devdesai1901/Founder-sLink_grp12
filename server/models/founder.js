// Define for Founder Schema
import mongoose from "mongoose";
const FounderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startupName: { type: String, required: true },
  startupIndustry: { type: String, required: true },
  companyDescription: { type: String, maxlength: 2000 },
  establishYear: { type: Number, required: true },
  fundingStage: {
    type: String,
    enum: ["Seed", "Series A", "Series B", "IPO"],
    required: true,
  },
  amountToRaiseFund: { type: Number, required: true },
  pitchDescription: { type: String, maxlength: 5000 },
  posts: [
    {
      pitchTitle: { type: String, required: true },
      pitchDescription: { type: String, required: true },
      industry: { type: String, required: true },
      fundingStage: {
        type: String,
        enum: ["Seed", "Series A", "Series B", "IPO"],
        required: true,
      },
      amountRequired: { type: Number, required: true },
      investorsInterested: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Investor",
        },
      ],
      likes: {
        type: Number,
        default: 0,
      }, // Default value for likes is set to 0
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  coFounders: [
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Founder = mongoose.model("Founder", FounderSchema);

export default Founder;
