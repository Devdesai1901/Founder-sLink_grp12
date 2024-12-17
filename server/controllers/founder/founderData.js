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
      } = data;
  
      // Perform field-level validations
      // validation.stringVerifyer("Startup Name", startupName, true, 2, 25);
      // validation.stringVerifyer("Startup Industry", startupIndustry, true, 2, 25);
      // validation.stringVerifyer("Company Description", companyDescription, true, 2, 2000);
      // validation.dateOfBirthVerifyer(establishYear); // Assuming this checks year validity
      if (!["Seed", "Series A", "Series B", "IPO"].includes(fundingStage)) {
        throw new Error("Invalid funding stage.");
      }
      if (!amountToRaiseFund || isNaN(amountToRaiseFund) || amountToRaiseFund <= 0) {
        throw new Error("Amount to raise must be a valid number greater than 0.");
      }
      if (tam && (isNaN(tam) || tam < 0)) {
        throw new Error("TAM must be a valid number greater than or equal to 0.");
      }
      if (sam && (isNaN(sam) || sam < 0)) {
        throw new Error("SAM must be a valid number greater than or equal to 0.");
      }
      if (companyReserves && (isNaN(companyReserves) || companyReserves < 0)) {
        throw new Error("Company reserves must be a valid number greater than or equal to 0.");
      }
      // if (website && !isValidURL(website)) {
      //   throw new Error("Website must be a valid URL.");
      // }
      // if (linkedIn && !isValidURL(linkedIn)) {
      //   throw new Error("LinkedIn must be a valid URL.");
      // }
      // if (twitter && !isValidURL(twitter)) {
      //   throw new Error("Twitter must be a valid URL.");
      // }
  
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
          ...financialDetails, // Additional fields in financialDetails object
        },
        majorCompetitors,
        milestones,
        keyMetrics,
        traction,
        socialLinks: {
          website: website || null,
          linkedIn: linkedIn || null,
          twitter: twitter || null,
        },
      };
  
      // Save the profile to MongoDB
      const createdProfile = await Founder.create(newFounderProfile);
      console.log(createdProfile)
      return createdProfile;
    } catch (error) {
      console.error("Error creating founder profile:", error);
      throw new Error(error.message || "Unable to create founder profile.");
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
