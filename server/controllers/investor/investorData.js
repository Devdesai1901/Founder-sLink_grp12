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
    const investor = await User.find({ userType: "Investor" });
    if (!investor) throw "User Not found";
    return investor;
  },
};

export default exprtedMethod;
