import { ObjectId } from "mongodb";
import User from "../../models/user.js";
import validation from "../../utils/validation.js";
let exprtedMethod = {
  async getInvestorById(id) {
    validation.checkId(id);
    const objectId = new ObjectId(id);
    const user = await User.findById(objectId);
    if (!user) throw "User Not found";
    return user;
  },

  async getAllInvestor() {
    const founders = await User.find({ userType: "Investor" });
    if (!founders) throw "User Not found";
    return founders;
  },
};

export default exprtedMethod;
