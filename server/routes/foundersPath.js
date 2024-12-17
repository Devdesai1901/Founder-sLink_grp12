import { Router } from "express";
import founderMethods from "../controllers/founder/founderData.js";
import validation from "../utils/validation.js";
const router = Router();

// get the all list of users who are founders
router.route("/getList").get(async (req, res) => {
  try {
    const founders = await founderMethods.getAllFounders();
    return res.status(200).json(founders);
  } catch (e) {
    return res.status(400).json({ error: "unable to fetch data" });
  }
});

// Route to render the DealDashboard
router.route("/DealDashboard").get(async (req, res) => {
  try {
    const founderId = req.session.user.id;
    validation.checkId(founderId);

    // Fetch necessary data using investorId
    const dealDetails = await founderMethods.getFounderrDealsDetails(founderId);
    console.log("Founder Data:", dealDetails);
    // Render the DealDashboard view with the fetched data
    res.render("founders/dealDashboard", { dealDetails });
  } catch (e) {
    return res
      .status(400)
      .json({ error: "error in rendering founders DealDashboard page" });
  }
});

// route to just get the User data from User Table
router.route("/dashboard/").get(async (req, res) => {
  try {
    const userId = req.session.user.id;

    validation.checkId(userId);
    let uniqueUser = await founderMethods.getFounderById(userId);
    // res.cookie("role", uniqueUser.userType);
    // res.cookie("firstName", uniqueUser.firstName);
    // res.cookie("lastName", uniqueUser.lastName);
    // res.cookie("email", uniqueUser.email);

    // uniqueUser._id = String(uniqueUser._id);
    // res.cookie("id", JSON.stringify(uniqueUser._id));
    res.render("common/dashboard");
  } catch (e) {
    return res
      .status(400)
      .json({ error: "error in rendring founder dashboard page" });
  }
});

//route to get to the pitch form
router
  .route("/pitchform")
  .get(async (req, res) => {
    res.render("founders/pitchform");
  })
  .post(async (req, res) => {
    try {
      let { pitchTitle, pitchDescription, fundingStage, amountRequired } =
        req.body;
      let userId = req.query.userId;
      console.log(userId)
      userId = userId.replace(/^"|"$/g, "");
      userId = validation.checkId(userId, "userId");
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

      const newpost = await founderMethods.createPost(
        userId,
        pitchTitle,
        pitchDescription,
        fundingStage,
        amountRequired
      );

      if (newpost.postStatus) {
        return res.status(200).json(newpost);
      } else {
        return res.status(400).json({ error: "Unable to save the post" });
      }
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

// route to just get the Founders Data from Founders Table
router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const userId = req.params.id;
      console.log(userId);
      validation.checkId(userId);
      const founder = await founderMethods.getFounderFromFounderById(userId);
      res.render("founders/profile", { founder });
    } catch (e) {
      return res
        .status(400)
        .json({ error: "error in rendring founder profile page" });
    }
  })
  .post()
  .put();



export default router;
