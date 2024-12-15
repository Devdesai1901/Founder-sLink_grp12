import mongoose from "mongoose";
import User from "../models/user.js";
import Founder from "../models/founder.js";
import Investor from "../models/investor.js";
import ConnectionRequest from "../models/connectionRequest.js";
import Chat from "../models/chat.js";

const dbURI = "mongodb://localhost:27017/founderslink";
// Sample data to insert
const sampleUsers = [
  {
    firstName: "Dev",
    lastName: "Desai",
    email: "john.doe@example.com",
    password: "password123", // You should hash the password in production
    userType: "Founder",
    phoneCode: "+1",
    phoneNumber: "1234567890",
    is_online: "0",
    dateOfBirth: new Date("1985-06-15"),
  },
  {
    firstName: "Rushi",
    lastName: "Parikh",
    email: "dev@example.com",
    password: "password123", // You should hash the password in production
    userType: "Founder",
    phoneCode: "+1",
    phoneNumber: "1234567890",
    is_online: "0",
    dateOfBirth: new Date("1985-06-15"),
  },
  {
    firstName: "Nakshatra",
    lastName: "Desai",
    email: "stevens@example.com",
    password: "password123", // You should hash the password in production
    userType: "Founder",
    phoneCode: "+1",
    phoneNumber: "1234567890",
    is_online: "0",
    dateOfBirth: new Date("1985-06-15"),
  },
  {
    firstName: "Aadam",
    lastName: "gandhi",
    email: "jane.smith@example.com",
    password: "password123", // Hash in production
    userType: "Investor",
    phoneCode: "+1",
    phoneNumber: "0987654321",
    is_online: "0",
    dateOfBirth: new Date("1990-09-25"),
  },
  {
    firstName: "Panth",
    lastName: "shah",
    email: "panth.smith@example.com",
    password: "password123", // Hash in production
    userType: "Investor",
    phoneCode: "+1",
    phoneNumber: "0987654321",
    is_online: "0",
    dateOfBirth: new Date("1990-09-25"),
  },
];

const sampleFounders = [
  {
    userId: null,
    startupName: "Tech Innovators",
    startupIndustry: "Technology",
    companyDescription: "An innovative startup focusing on AI technology.",
    establishYear: 2021,
    fundingStage: "Seed",
    amountToRaiseFund: 500000,
    posts: [
      {
        pitchTitle: "AI Research for the Future",
        pitchDescription: "Looking for investors to scale up our AI research.",
        industry: "Technology",
        fundingStage: "Seed",
        amountRequired: 200000,
        investorsInterested: [
          "603d2f7177d24f372c26f9e4",
          "603d2f7177d24f372c26f9e5",
        ],
        likes: 150,
      },
    ],
    coFounders: [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
      },
    ],
    numberOfEmployees: 10,
    financialDetails: {
      totalAddressableMarket: 100000000,
      serviceableAvailableMarket: 50000000,
      totalCompanyReserves: 1000000,
      companySpent: {
        salaries: 200000,
        marketingCost: 50000,
        productRnD: 100000,
        miscellaneous: 20000,
      },
      revenueHistory: [
        { year: 2021, revenue: 1000000 },
        { year: 2022, revenue: 2500000 },
      ],
      equityDilutionHistory: [
        { year: 2022, dilutionPercentage: 5, nameOfInvestor: "Investor One" },
        { year: 2023, dilutionPercentage: 3, nameOfInvestor: "Investor Two" },
      ],
    },
    majorCompetitors: ["AI Labs", "Tech Giants"],
    milestones: [
      {
        milestoneName: "Product Launch",
        dateAchieved: "2023-05-01T00:00:00.000Z",
        description: "Launched the first version of the product.",
      },
      {
        milestoneName: "Funding Secured",
        dateAchieved: "2023-07-01T00:00:00.000Z",
        description: "Raised $1M in seed funding.",
      },
    ],
    keyMetrics: {
      valuation: 5000000,
      profitMargin: 20,
      totalFundingReceived: 1000000,
      teamSize: 10,
    },
    traction: {
      monthlyActiveUsers: 5000,
      customerRetentionRate: 85,
      annualRecurringRevenue: 100000,
    },
    socialLinks: {
      website: "https://techinnovators.com",
      linkedIn: "https://linkedin.com/company/techinnovators",
      twitter: "https://twitter.com/techinnovators",
    },
  },
];

const sampleInvestors = [
  {
    userId: null, // Will be set after creating the User
    investorType: "Angel",
    investmentPreferences: {
      industries: ["Technology", "AI"],
      fundingStages: ["Seed", "Series A"],
      geographicPreferences: ["USA"],
      minimumInvestmentAmount: 100000,
      preferredStartupSize: "Medium",
    },
    contactInformation: {
      phone: "123456789",
      email: "angel.investor@example.com",
      preferredContactMethod: "Email",
    },
    portfolio: [],
    performanceMetrics: {
      totalInvested: 500000,
      returnsGenerated: 200000,
      activeDeals: 2,
      portfolioValue: 700000,
    },
    socialLinks: {
      website: "https://angelinvestor.com",
      linkedIn: "https://linkedin.com/in/angelinvestor",
    },
    description: "Angel investor focused on emerging technologies.",
  },
];

const sampleConnectionRequests = [
  {
    sender: null, // Will be set later
    receiver: null, // Will be set later
    status: "Pending",
  },
];

const sampleChats = [
  {
    sender_id: null, // Will be set later
    receiver_id: null, // Will be set later
    message: "Hello, I'm interested in your startup.",
  },
];
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

    // Insert Users
    const users = await User.insertMany(sampleUsers);

    // Set userIds for Founder and Investor
    sampleFounders[0].userId = users[0]._id;
    sampleInvestors[0].userId = users[1]._id;

    // Insert Founders and Investors
    const founders = await Founder.insertMany(sampleFounders);
    const investors = await Investor.insertMany(sampleInvestors);

    // Set user references in ConnectionRequests and Chats
    sampleConnectionRequests[0].sender = users[0]._id;
    sampleConnectionRequests[0].receiver = users[1]._id;

    sampleChats[0].sender_id = users[0]._id;
    sampleChats[0].receiver_id = users[1]._id;

    // Insert ConnectionRequests and Chats
    await ConnectionRequest.insertMany(sampleConnectionRequests);
    await Chat.insertMany(sampleChats);

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    mongoose.connection.close();
  });
