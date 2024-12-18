import mongoose from "mongoose";

const DealSchema = new mongoose.Schema({
  progressLogs: [
    {
      date: { type: Date, default: Date.now },
      amount: { type: Number, required: true },
      notes: { type: String, default: "" },
      action: { type: String, required: true },
    },
  ],
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: "Investor" }, // Changed from investorIds to investorId
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Founder",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Closed", "Completed", "Canceled"],
    default: "Pending",
  },
});

const Deal = mongoose.model("Deal", DealSchema);
export default Deal;
