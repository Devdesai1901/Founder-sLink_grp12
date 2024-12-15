import mongoose from "mongoose";
import User from "../models/user.js";
import Chat from "../models/chat.js";
import ConnectionRequest from "../models/connectionRequest.js";
import Founder from "../models/founder.js";
import Investor from "../models/investor.js";

const MONGO_URI = "mongodb://localhost:27017/founderslink"; // Replace with your MongoDB URI

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const generateDummyData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Chat.deleteMany({});
    await ConnectionRequest.deleteMany({});
    await Founder.deleteMany({});
    await Investor.deleteMany({});

    // Create dummy users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = new User({
        firstName: `FirstName${i}`,
        lastName: `LastName${i}`,
        email: `user${i}@example.com`,
        password: `password${i}`,
        userType: i % 2 === 0 ? "founder" : "investor",
        phoneCode: "+1",
        phoneNumber: `123456789${i}`,
        bio: `This is a bio for user${i}.`,
        profilePicture: `https://example.com/profile${i}.jpg`,
        is_online: i % 2 === 0 ? "1" : "0",
        dateOfBirth: new Date(1990, i % 12, (i % 28) + 1),
      });
      users.push(user);
      await user.save();
    }

    // Create dummy chats
    for (let i = 0; i < 20; i++) {
      const chat = new Chat({
        sender_id: users[i % 10]._id,
        receiver_id: users[(i + 1) % 10]._id,
        message: `This is a message ${i}.`,
      });
      await chat.save();
    }

    // Create dummy connection requests
    for (let i = 0; i < 10; i++) {
      const connectionRequest = new ConnectionRequest({
        sender: users[i % 10]._id,
        receiver: users[(i + 1) % 10]._id,
        status: i % 3 === 0 ? "Accepted" : i % 3 === 1 ? "Rejected" : "Pending",
      });
      await connectionRequest.save();
    }

    // Create dummy founders
    for (let i = 0; i < 5; i++) {
      const founder = new Founder({
        userId: users[i]._id,
        startupName: `Startup${i}`,
        startupIndustry: `Industry${i}`,
        companyDescription: `This is a description for Startup${i}.`,
        establishYear: 2000 + i,
        fundingStage:
          i % 4 === 0
            ? "Seed"
            : i % 4 === 1
            ? "Series A"
            : i % 4 === 2
            ? "Series B"
            : "IPO",
        amountToRaiseFund: 1000000 * (i + 1),
        posts: [
          {
            pitchTitle: `Pitch Title ${i}`,
            pitchDescription: `This is a pitch description for Startup${i}.`,
            fundingStage:
              i % 4 === 0
                ? "Seed"
                : i % 4 === 1
                ? "Series A"
                : i % 4 === 2
                ? "Series B"
                : "IPO",
            amountRequired: 500000 * (i + 1),
            investorsInterested: [users[(i + 1) % 10]._id],
            likes: i * 10,
          },
        ],
        coFounders: [
          {
            firstName: `CoFounderFirstName${i}`,
            lastName: `CoFounderLastName${i}`,
            email: `cofounder${i}@example.com`,
          },
        ],
        numberOfEmployees: 10 * (i + 1),
        financialDetails: {
          totalAddressableMarket: 10000000 * (i + 1),
          serviceableAvailableMarket: 5000000 * (i + 1),
          totalCompanyReserves: 2000000 * (i + 1),
          companySpent: {
            salaries: 100000 * (i + 1),
            marketingCost: 50000 * (i + 1),
            productRnD: 20000 * (i + 1),
            miscellaneous: 10000 * (i + 1),
          },
          revenueHistory: [
            { year: 2020, revenue: 100000 * (i + 1) },
            { year: 2021, revenue: 200000 * (i + 1) },
          ],
          equityDilutionHistory: [
            {
              year: 2020,
              dilutionPercentage: 10 * (i + 1),
              nameOfInvestor: `Investor${i}`,
            },
          ],
        },
        majorCompetitors: [`Competitor${i}`],
        milestones: [
          {
            milestoneName: `Milestone${i}`,
            dateAchieved: new Date(2020, i % 12, (i % 28) + 1),
            description: `This is a description for Milestone${i}.`,
          },
        ],
        keyMetrics: {
          valuation: 10000000 * (i + 1),
          profitMargin: 20 * (i + 1),
          totalFundingReceived: 5000000 * (i + 1),
          teamSize: 10 * (i + 1),
        },
        traction: {
          monthlyActiveUsers: 1000 * (i + 1),
          customerRetentionRate: 80 * (i + 1),
          annualRecurringRevenue: 1000000 * (i + 1),
        },
        socialLinks: {
          website: `https://startup${i}.com`,
          linkedIn: `https://linkedin.com/startup${i}`,
          twitter: `https://twitter.com/startup${i}`,
        },
      });
      await founder.save();
    }

    // Create dummy investors
    for (let i = 5; i < 10; i++) {
      const investor = new Investor({
        userId: users[i]._id,
        investorType:
          i % 5 === 0
            ? "Angel"
            : i % 5 === 1
            ? "Venture Capitalist"
            : i % 5 === 2
            ? "Private Equity"
            : i % 5 === 3
            ? "Family Office"
            : "Corporate",
        investmentPreferences: {
          industries: [`Industry${i}`],
          fundingStages: ["Seed", "Series A", "Series B", "IPO"],
          geographicPreferences: ["USA", "Europe"],
          minimumInvestmentAmount: 100000 * (i + 1),
          preferredStartupSize:
            i % 3 === 0 ? "Small" : i % 3 === 1 ? "Medium" : "Large",
        },
        contactInformation: {
          phone: `123456789${i}`,
          email: `investor${i}@example.com`,
          preferredContactMethod:
            i % 3 === 0 ? "Email" : i % 3 === 1 ? "Phone" : "Message",
        },
        portfolio: [
          {
            startupId: users[(i + 1) % 10]._id,
            amountInvested: 100000 * (i + 1),
            equityOwned: 10 * (i + 1),
            exitDate: new Date(2020, i % 12, (i % 28) + 1),
            exitAmount: 200000 * (i + 1),
          },
        ],
        performanceMetrics: {
          totalInvested: 1000000 * (i + 1),
          returnsGenerated: 2000000 * (i + 1),
          activeDeals: 5 * (i + 1),
          portfolioValue: 5000000 * (i + 1),
        },
        socialLinks: {
          website: `https://investor${i}.com`,
          linkedIn: `https://linkedin.com/investor${i}`,
          twitter: `https://twitter.com/investor${i}`,
          personalBlog: `https://blog.investor${i}.com`,
        },
        description: `This is a description for Investor${i}.`,
        rank: i * 10,
      });
      await investor.save();
    }

    console.log("Dummy data generated successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error generating dummy data:", error);
    mongoose.connection.close();
  }
};

generateDummyData();
