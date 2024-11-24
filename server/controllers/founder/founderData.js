import { ObjectId } from "mongodb";
import validation from "../../utils/validation.js";
import User from "../../models/user.js";
let exprtedMethod = {
  async getFounderById(id) {
    validation.checkId(id);
    const objectId = new ObjectId(id);
    const user = await User.findById(objectId);
    if (!user) throw "User Not found";
    return user;
  },

  async getAllFounders() {
    const founders = await User.find({ userType: "Founder" });
    if (!founders) throw "User Not found";
    return founders;
  },
};

export default exprtedMethod;
