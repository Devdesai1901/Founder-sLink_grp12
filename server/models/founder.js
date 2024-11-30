import mongoose from "mongoose";

const FounderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startupName: { type: String, required: true },
  startupIndustry: { type: String, required: true },
  companyDescription: { type: String, maxlength: 2000 }, // Brief description of the company
  establishYear: { type: Number, required: true }, // Year of establishment
  fundingStage: {
    type: String,
    enum: ["Seed", "Series A", "Series B", "IPO"],
    required: true,
  },
  amountToRaiseFund: { type: Number, required: true }, // Funding goal in USD
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
      },
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
  numberOfEmployees: { type: Number, required: true, default: 1 }, // Total number of employees
  financialDetails: {
    totalAddressableMarket: { type: Number }, // TAM in USD
    serviceableAvailableMarket: { type: Number }, // SAM in USD
    totalCompanyReserves: { type: Number }, // Total reserves in USD
    companySpent: {
      salaries: { type: Number, default: 0 }, // Money spent on salaries
      marketingCost: { type: Number, default: 0 }, // Marketing expenses
      productRnD: { type: Number, default: 0 }, // Research and Development costs
      miscellaneous: { type: Number, default: 0 }, // Miscellaneous expenses
    },
    revenueHistory: [
      { year: Number, revenue: Number }, // Data for plotting Revenue Graph
    ],
    equityDilutionHistory: [
      {
        year: Number,
        dilutionPercentage: Number, // Percentage of equity diluted
        nameOfInvestor: { type: String, required: true }, // Name of the investor
      },
    ],
  },
  majorCompetitors: [String], // List of competitors
  milestones: [
    {
      milestoneName: { type: String },
      dateAchieved: { type: Date },
      description: { type: String },
    },
  ],
  keyMetrics: {
    valuation: { type: Number }, // Current valuation in USD
    profitMargin: { type: Number }, // Profit margin as a percentage
    totalFundingReceived: { type: Number }, // Total funding in USD
    teamSize: { type: Number }, // Number of team members (can match numberOfEmployees or include contractors)
  },
  traction: {
    monthlyActiveUsers: { type: Number }, // Active users per month
    customerRetentionRate: { type: Number }, // Retention rate as a percentage
    annualRecurringRevenue: { type: Number }, // ARR for subscription-based startups
  },
  socialLinks: {
    website: { type: String },
    linkedIn: { type: String },
    twitter: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Founder = mongoose.model("Founder", FounderSchema);

export default Founder;
