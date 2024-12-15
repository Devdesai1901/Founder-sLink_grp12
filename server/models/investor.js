//investor Schema
import mongoose from "mongoose";
const InvestorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  investorType: {
    type: String,
    enum: [
      "Angel",
      "Venture Capitalist",
      "Private Equity",
      "Family Office",
      "Corporate",
    ],
    required: true,
  }, // Type of investor
  investmentPreferences: {
    industries: [String],
    fundingStages: [String],
    geographicPreferences: [String],
    minimumInvestmentAmount: { type: Number }, // Minimum amount investor is willing to invest
    preferredStartupSize: { type: String, enum: ["Small", "Medium", "Large"] }, // Startup size preference
  },
  contactInformation: {
    phone: { type: String }, // Contact phone number
    email: { type: String }, // Contact email address
    preferredContactMethod: {
      type: String,
      enum: ["Email", "Phone", "Message"],
    }, // Preferred contact method
  },
  portfolio: [
    {
      startupId: { type: mongoose.Schema.Types.ObjectId, ref: "Startup" },
      amountInvested: { type: Number },
      equityOwned: { type: Number }, // Percentage of equity owned
      exitDate: { type: Date }, // Date when the investor exited or plans to exit
      exitAmount: { type: Number }, // Amount received upon exit
    },
  ],
  performanceMetrics: {
    totalInvested: { type: Number }, // Total amount invested
    returnsGenerated: { type: Number }, // Total returns generated
    activeDeals: { type: Number }, // Active investment deals
    portfolioValue: { type: Number }, // Total value of the investor's portfolio
  },
  socialLinks: {
    website: { type: String },
    linkedIn: { type: String },
    twitter: { type: String },
    personalBlog: { type: String }, // Investor's personal or professional blog
  },
  description: { type: String }, // Description of the investor, written by the founder
  rank: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Investor = mongoose.model("Investor", InvestorSchema);
export default Investor;
