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
    userId: null, // Will be set after creating the User
    startupName: "Tech Innovators",
    startupIndustry: "Technology",
    companyDescription: "An innovative startup focusing on AI technology.",
    establishYear: 2021,
    fundingStage: "Seed",
    amountToRaiseFund: 500000,
    pitchDescription: "Looking for investors to scale up our AI research.",
    posts: [
      {
        pitchTitle: "AI Startup Pitch",
        pitchDescription: "Seeking funds to expand AI research.",
        industry: "Technology",
        fundingStage: "Seed",
        amountRequired: 300000,
        investorsInterested: [],
      },
    ],
    coFounders: [
      {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@example.com",
      },
    ],
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
