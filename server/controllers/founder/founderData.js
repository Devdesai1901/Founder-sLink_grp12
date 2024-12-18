import { ObjectId } from "mongodb";
import validation from "../../utils/validation.js";
import User from "../../models/user.js";
import Investor from "../../models/investor.js";
import Founder from "../../models/founder.js";
import Deal from "../../models/Deal.js";
import nodemailer from "nodemailer";
let exprtedMethod = {
  // function to just get the User data from User Table
  async getFounderById(id) {
    validation.checkId(id);
    const objectId = new ObjectId(id);
    const user = await User.findById(objectId);
    if (!user) throw "User Not found";
    return user;
  },

  //create Founders PRofile
  async createProfile(data, userId) {
    try {
      // Validate userId
      validation.checkId(userId);

      // Destructure the data
      const {
        startupName,
        startupIndustry,
        companyDescription,
        establishYear,
        fundingStage,
        amountToRaiseFund,
        tam,
        sam,
        companyReserves,
        website,
        linkedIn,
        twitter,
        posts = [],
        coFounders = [],
        numberOfEmployees = 1,
        financialDetails = {},
        majorCompetitors = [],
        milestones = [],
        keyMetrics = {},
        traction = {},
        socialLinks = {},
      } = data;

      // Perform field-level validations
      if (!["Seed", "Series A", "Series B", "IPO"].includes(fundingStage)) {
        throw new Error("Invalid funding stage.");
      }
      if (
        !amountToRaiseFund ||
        isNaN(amountToRaiseFund) ||
        amountToRaiseFund <= 0
      ) {
        throw new Error(
          "Amount to raise must be a valid number greater than 0."
        );
      }
      if (tam && (isNaN(tam) || tam < 0)) {
        throw new Error(
          "TAM must be a valid number greater than or equal to 0."
        );
      }
      if (sam && (isNaN(sam) || sam < 0)) {
        throw new Error(
          "SAM must be a valid number greater than or equal to 0."
        );
      }
      if (companyReserves && (isNaN(companyReserves) || companyReserves < 0)) {
        throw new Error(
          "Company reserves must be a valid number greater than or equal to 0."
        );
      }

      // Construct the new founder profile
      const newFounderProfile = {
        userId: new ObjectId(userId),
        startupName,
        startupIndustry,
        companyDescription,
        establishYear,
        fundingStage,
        amountToRaiseFund,
        posts,
        coFounders,
        numberOfEmployees,
        financialDetails: {
          totalAddressableMarket: tam || null,
          serviceableAvailableMarket: sam || null,
          totalCompanyReserves: companyReserves || null,
          companySpent: {
            salaries: financialDetails.companySpent.salaries,
            marketingCost: financialDetails.companySpent.marketingCost,
            productRnD: financialDetails.companySpent.productRnD,
            miscellaneous: financialDetails.companySpent.miscellaneous,
          },
          revenueHistory: financialDetails.revenueHistory,
          equityDilutionHistory: financialDetails.equityDilutionHistory,
        },
        majorCompetitors,
        milestones,
        keyMetrics: {
          valuation: keyMetrics.valuation,
          profitMargin: keyMetrics.profitMargin,
          totalFundingReceived: keyMetrics.totalFundingReceived,
          teamSize: keyMetrics.teamSize,
        },
        traction: {
          monthlyActiveUsers: traction.monthlyActiveUsers,
          customerRetentionRate: traction.customerRetentionRate,
          annualRecurringRevenue: traction.annualRecurringRevenue,
        },
        socialLinks: {
          website: socialLinks.website || null,
          linkedIn: socialLinks.linkedIn || null,
          twitter: socialLinks.twitter || null,
        },
      };

      // Check if a profile already exists for the user and update it, or create a new one if it doesn't exist
      const createdProfile = await Founder.findOneAndUpdate(
        { userId: new ObjectId(userId) },
        newFounderProfile,
        { new: true, upsert: true }
      );

      console.log(createdProfile);
      return createdProfile;
    } catch (error) {
      console.error("Error creating or updating founder profile:", error);
      throw new Error(
        error.message || "Unable to create or update founder profile."
      );
    }
  },

  // function to create a post

  async createPost(
    userId,
    pitchTitle,
    pitchDescription,
    fundingStage,
    amountRequired
  ) {
    // Validate inputs
    userId = validation.checkId(userId);
    pitchTitle = validation.checkString(pitchTitle, "pitchTitle");
    validation.checkLenCharacters(pitchTitle, "pitchTitle", 5, 50);
    pitchDescription = validation.checkString(
      pitchDescription,
      "pitchDescription"
    );
    validation.checkLenCharacters(
      pitchDescription,
      "pitchDescription",
      100,
      20000
    );
    fundingStage = validation.checkFundingStage(fundingStage, "fundingStage");
    amountRequired = validation.checkAmount(amountRequired, "amountRequired");

    // Create new post object
    const newPost = {
      pitchTitle,
      pitchDescription,
      fundingStage,
      amountRequired,
    };

    // Fetch founder using userId
    userId = new ObjectId(userId);
    const founder = await Founder.findOne({ userId: userId });
    if (!founder) {
      throw new Error("First Complete the User Profile in profile section");
    }

    // Add post to founder's posts
    founder.posts.push(newPost);
    await founder.save();

    // Fetch investors from the same industry
    const investors = await Investor.find({
      "investmentPreferences.industries": founder.startupIndustry,
    });

    // Extract investor user IDs
    const investorUserIds = investors.map((investor) => investor.userId);

    // Fetch investor user details
    const investorsUser = await User.find({ _id: { $in: investorUserIds } });

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use 'gmail' for Gmail's SMTP
      auth: {
        user: "linkfounders@gmail.com", // Your Gmail address
        pass: "kfks zrxj uafb ggvc", // Your App Password
      },
    });

    // Prepare and send emails
    if (investorsUser.length > 0) {
      const emailPromises = investorsUser.map((investorUser) => {
        const emailMessage = {
          from: "linkfounders@gmail.com",
          to: investorUser.email,
          subject: `New Pitch from ${founder.name}`,
          text: `Hello ${investorUser.name},
        ${founder.name} has created a new pitch titled "${pitchTitle}". Here's a brief description:
        ${pitchDescription}
        Funding Stage: ${fundingStage}
        Amount Required: $${amountRequired}
        If you're interested, please log in to the platform for more details.

        Best regards,
        The Platform Team`,
        };
        return transporter.sendMail(emailMessage);
      });

      // Wait for all emails to be sent
      await Promise.all(emailPromises);
    }

    return { postStatus: true, emailsSent: investorsUser.length > 0 };
  },

  async getFounderrDealsDetails(founderId) {
    validation.checkId(founderId);
    const objectId = new ObjectId(founderId);

    // Fetch all deals for the given founderId
    const deals = await Deal.find({ founderId: objectId });

    // Prepare an array to hold the deal details
    const dealDetails = [];
    console.log("DEALS", deals);
    // Iterate through each deal to enrich the data
    for (let deal of deals) {
      // Retrieve the investor details from the populated investorId
      const investor = await User.findOne({ _id: deal.investorId }).select(
        "firstName lastName phoneNumber email"
      );

      console.log("Investor:", investor);
      // Add the relevant data into the deal object
      dealDetails.push({
        investorId: investor._id,
        progressLogs: deal.progressLogs, // Include the entire progressLogs array
        status: deal.status, // Include the status of the deal
        investorDetails: {
          firstName: investor.firstName,
          lastName: investor.lastName,
          phoneNumber: investor.phoneNumber,
          email: investor.email,
        },
      });
    }
    console.log("dealdetails:", dealDetails);
    // Return the enriched deal details array
    return dealDetails;
  },
  // function to just get the Founders Data from Founders Table
  async getFounderFromFounderById(id) {
    validation.checkId(id);
    const objectId = new ObjectId(id);
    const user = await Founder.findOne({ userId: objectId });
    console.log(user);
    if (!user) throw "User Not found";
    return user;
  },

  // function to get the all list of users who are fonnders
  async getAllFounders() {
    const founders = await User.find({ userType: "founder" });

    if (!founders) throw "User Not found";
    return founders;
  },

  // get all user posts
  async getAllFoundersPosts() {
    const founders = await Founder.find();
    const userFounders = await this.getAllFounders();
    if (!founders || founders.length === 0) {
      throw new Error("Founders' posts not found");
    }

    const postData = [];

    userFounders.forEach((user) => {
      founders.forEach((founder) => {
        if (user._id.toString() === founder.userId.toString()) {
          if (founder.posts && founder.posts.length > 0) {
            let min = Math.min(3, founder.posts.length);
            postData.push({
              firstname: user.firstName,
              LastName: user.lastName,
              industry: founder.startupIndustry,
              id: user._id,
              posts: founder.posts.slice(0, min),
              startUpName: founder.startupName,
            });
          }
        }
      });
    });

    return postData;
  },
};

export default exprtedMethod;
