import { ObjectId } from "mongodb";
import User from "../../models/user.js";
import validation from "../../utils/validation.js";
import Investor from "../../models/investor.js";
import Deal from "../../models/Deal.js";
import Founder from "../../models/founder.js";

let exportedMethod = {
  async getInvestorById(id) {
    validation.checkId(id);
    const objectId = new ObjectId(id);
    const user = await User.findById(objectId);
    if (!user) throw "User Not found";
    return user;
  },

  async getInvestorFromInvestorById(id) {
    validation.checkId(id);
    const objectId = new ObjectId(id);
    const user = await Investor.findOne({ userId: objectId });
    if (!user) throw "User Not found";
    return user;
  },
  async getAllInvestor() {
    const investor = await User.find({ userType: "investor" });
    if (!investor) throw "User Not found";
    return investor;
  },

  async getAllInvestorDetails() {
    const investor = await this.getAllInvestor();
    const investorDetails = await Investor.find();

    if (!investorDetails) throw "Investor Details Not found";

    const investorData = [];

    investor.forEach((user) => {
      investorDetails.forEach((userDetails) => {
        if (user._id.toString() === userDetails.userId.toString()) {
          investorData.push({
            id: user._id,
            firstname: user.firstName,
            LastName: user.lastName,
            email: user.email,
            industry: userDetails.investorType,
            description: userDetails.description,
          });
        }
      });
    });
    return investorData;
  },
  async saveProgress(status, investorId, founderId, progressLog) {
    try {
      // Validate and convert IDs to MongoDB ObjectIDs
      if (!ObjectId.isValid(investorId) || !ObjectId.isValid(founderId)) {
        throw new Error("Invalid ID format");
      }
      investorId = new ObjectId(investorId);
      founderId = new ObjectId(founderId);

      console.log("Investor ID DATA FUNCTION:", investorId);
      console.log("Founder ID:DATAFUNCTION", founderId);
      // Find the deal or create a new one
      let deal = await Deal.findOne({ investorId, founderId });

      if (!deal) {
        deal = new Deal({
          investorId,
          founderId,
          progressLogs: [progressLog],
          status: status, // Use the status parameter
        });
      } else {
        deal.progressLogs.push(progressLog);
        deal.status = status; // Update the status
      }

      await deal.save();
    } catch (error) {
      console.error("Error saving progress:", error);
      throw new Error("Unable to save progress");
    }
  },

  async getInvestorFromInvestorById(id) {
    validation.checkId(id);
    const objectId = new ObjectId(id);
    const user = await Investor.findOne({ userId: objectId });
    if (!user) throw "User Not found";
    return user;
  },

  async getInvestorDealsDetails(investorId) {
    try {
      // Validate the investorId
      const objectId = new ObjectId(investorId);

      // Fetch all deals for the given investorId
      const deals = await Deal.find({ investorId: objectId });

      // Prepare an array to hold the details
      const dealDetails = [];
      console.log("DEALS", deals);
      // Iterate through each deal to enrich data
      for (let deal of deals) {
        // Retrieve the founder details from the populated founderId
        const founder = await Founder.findOne({
          userId: deal.founderId,
        }).select(
          "startupName startupIndustry companyDescription fundingStage amountToRaiseFund"
        );

        // Retrieve the user details for the founder from the populated userId
        // Retrieve the user details for the founder
        const user = await User.findOne({ _id: deal.founderId }).select(
          "firstName lastName phoneNumber email"
        );

        // Add all relevant details into the deal object
        dealDetails.push({
          founderId: deal.founderId.userId,
          progressLogs: deal.progressLogs, // Include entire progressLogs array
          status: deal.status,
          founderDetails: {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
          },
          startupDetails: {
            startupName: founder.startupName,
            startupIndustry: founder.startupIndustry,
            companyDescription: founder.companyDescription,
            fundingStage: founder.fundingStage,
            amountToRaiseFund: founder.amountToRaiseFund,
          },
        });
      }
      console.log("DEAL DETAILS", dealDetails);
      // Return the enriched deal details array
      return dealDetails;
    } catch (error) {
      console.error("Error fetching investor deals:", error);
      throw new Error("Failed to fetch investor deals details.");
    }
  },
};

export default exportedMethod;
