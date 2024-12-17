import { ObjectId } from "mongodb";
import validation from "../../utils/validation.js";
import User from "../../models/user.js";
import Founder from "../../models/founder.js";

// Helper function to validate URLs
// function isValidURL(url) {
//   try {
//     new URL(url);
//     return true;
//   } catch {
//     return false;
//   }
// }
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

    const newPost = {
      pitchTitle,
      pitchDescription,
      fundingStage,
      amountRequired,
    };
    userId = new ObjectId(userId);
    const founder = await Founder.findOne({ userId: userId });

    if (!founder) {
      throw new Error("Founder not found");
    }

    founder.posts.push(newPost);

    const savedFounder = await founder.save();

    return { poststatus: true };
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
