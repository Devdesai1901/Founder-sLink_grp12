import { ObjectId } from "mongodb";
import validation from "../../utils/validation.js";
import User from "../../models/user.js";
import Founder from "../../models/founder.js";
let exprtedMethod = {
  // function to just get the User data from User Table
  async getFounderById(id) {
    validation.checkId(id);
    const objectId = new ObjectId(id);
    const user = await User.findById(objectId);
    if (!user) throw "User Not found";
    return user;
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
    if (!user) throw "User Not found";
    return user;
  },

  // function to get the all list of users who are fonnders
  async getAllFounders() {
    const founders = await User.find({ userType: "Founder" });
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
