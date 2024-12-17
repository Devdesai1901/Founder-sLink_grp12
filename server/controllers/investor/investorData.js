import { ObjectId } from "mongodb";
import User from "../../models/user.js";
import validation from "../../utils/validation.js";
import Investor from "../../models/investor.js";
let exprtedMethod = {
  async getInvestorById(id) {
    validation.checkId(id);
    const objectId = new ObjectId(id);
    const user = await User.findById(objectId);
    if (!user) throw "User Not found";
    return user;
  },

  async createProfile(data, userId) {
    validation.checkId(userId);

    // Validate the data object
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data provided for creating profile.");
    }

    // Ensure userId is an ObjectId
    const objectId = new ObjectId(userId);

    // Prepare the profile data
    const profileData = {
      userId: objectId,
      investorType: data.investorType,
      investmentPreferences: {
        industries: data.investmentPreferences.industries,
        fundingStages: data.investmentPreferences.fundingStages || [],
        geographicPreferences:
          data.investmentPreferences.geographicPreferences || [],
        minimumInvestmentAmount:
          data.investmentPreferences.minimumInvestmentAmount,
        preferredStartupSize:
          data.investmentPreferences.preferredStartupSize || null,
      },
      contactInformation: {
        phone: data.contactInformation.phone,
        email: data.contactInformation.email,
        preferredContactMethod:
          data.contactInformation.preferredContactMethod || null,
      },
      socialLinks: {
        website: data.socialLinks.website || null,
        linkedIn: data.socialLinks.linkedIn || null,
        twitter: data.socialLinks.twitter || null,
        personalBlog: data.socialLinks.personalBlog || null,
      },
      performanceMetrics: {
        totalInvested: data.performanceMetrics.totalInvested || 0,
        returnsGenerated: data.performanceMetrics.returnsGenerated || 0,
        activeDeals: data.performanceMetrics.activeDeals || 0,
        portfolioValue: data.performanceMetrics.portfolioValue || 0,
      },
      description: data.description || "",
      updatedAt: new Date(),
    };

    // Use findOneAndUpdate to create or update the profile
    const result = await Investor.findOneAndUpdate(
      { userId: objectId },
      { $set: profileData },
      { new: true, upsert: true }
    );

    return result;
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
};

export default exprtedMethod;
