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

    let investorData = [];

    investor.forEach((user) => {
      investorDetails.forEach((userDetails) => {
        if (user._id.toString() === userDetails.userId.toString()) {
          // Calculate total amount invested using reduce()
          const totalInvestment = userDetails.portfolio.reduce((sum, investment) => {
            return sum + (investment.amountInvested || 0);
          }, 0);
  
          // Add the required fields, including totalInvestment
          investorData.push({
            id: user._id,
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.email,
            industry: userDetails.investorType,
            description: userDetails.description,
            totalInvestment: totalInvestment, // New field for total investment
          });
        }
      });
    });
    investorData.sort((a, b) => b.totalInvestment - a.totalInvestment);
    return investorData;
  },
};

export default exprtedMethod;
