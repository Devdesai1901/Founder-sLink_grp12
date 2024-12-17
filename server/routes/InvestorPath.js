import { Router } from "express";
import investorMethods from "../controllers/investor/investorData.js";
import validation from "../utils/validation.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
const router = Router();

// epute to get all the list of the founder
router.route("/getList").get(async (req, res) => {
  try {
    const investor = await investorMethods.getAllInvestor();
    return res.status(200).json(investor);
  } catch (e) {
    return res.status(400).json({ error: "unable to fetch data" });
  }
});

// Route to render the DealDashboard
router.route("/DealDashboard").get(async (req, res) => {
  try {
    const investorId = req.session.user.id;
    validation.checkId(investorId);

    // Fetch necessary data using investorId
    const investorData = await investorMethods.getInvestorDealsDetails(
      investorId
    );
    console.log("Investor Data:", investorData);
    // Render the DealDashboard view with the fetched data
    res.render("investors/dealDashboard", { investorData });
  } catch (e) {
    return res
      .status(400)
      .json({ error: "error in rendering DealDashboard page" });
  }
});

//route  to get all the data of User from User Table
router.route("/dashboard/").get(async (req, res) => {
  try {
    const userId = req.session.user.id;
    validation.checkId(userId);
    let uniqueUser = await investorMethods.getInvestorById(userId);
    // res.cookie("role", uniqueUser.userType);
    // res.cookie("firstName", uniqueUser.firstName);
    // res.cookie("lastName", uniqueUser.lastName);
    // uniqueUser._id = uniqueUser._id.toString();
    // res.cookie("id", JSON.stringify(uniqueUser._id));
  
    res.render("common/dashboard");
  } catch (e) {
    return res
      .status(400)
      .json({ error: "error in rendring  investor dashboard page" });
  }
});

// save the progress for each user
router
  .route("/progress/:id")
  .get(async (req, res) => {
    try {
      const userId = req.session.user.id;
      console.log("USERID", userId);
      res.render("investors/progressForm");
    } catch (e) {
      return res
        .status(400)
        .json({ error: "error in rendring  investor progress page" });
    }
  })
  .post(async (req, res) => {
    try {
      const investorId = req.session.user.id;
      const {
        userId: founderId,
        date,
        note,
        action,
        amount,
        status,
      } = req.body;

      console.log("Investor ID:", investorId);
      console.log("Founder ID:", founderId);

      // Validate and convert IDs to MongoDB ObjectIDs
      if (
        !mongoose.Types.ObjectId.isValid(investorId) ||
        !mongoose.Types.ObjectId.isValid(founderId)
      ) {
        throw new Error("Invalid ID format");
      }
      const investorObjectId = new ObjectId(investorId);
      const founderObjectId = new ObjectId(founderId);

      // Create progress log object
      const progressLog = {
        date: new Date(date),
        amount: Number(amount),
        notes: note,
        action,
      };

      // Call the saveProgress method
      await investorMethods.saveProgress(
        status,
        investorObjectId,
        founderObjectId,
        progressLog
      );

      return res
        .status(200)
        .json({ message: "Progress successfully submitted!" });
    } catch (e) {
      console.error("Error submitting progress:", e);
      return res
        .status(400)
        .json({ error: "Error in rendering investor progress page" });
    }
  });

// save the progress for each user
router
  .route("/progress/:id")
  .get(async (req, res) => {
    try {
      const userId = req.session.user.id;
      console.log("USERID", userId);
      res.render("investors/progressForm");
    } catch (e) {
      return res
        .status(400)
        .json({ error: "error in rendring  investor progress page" });
    }
  })
  .post(async (req, res) => {
    try {
      const investorId = req.session.user.id;
      const {
        userId: founderId,
        date,
        note,
        action,
        amount,
        status,
      } = req.body;

      console.log("Investor ID:", investorId);
      console.log("Founder ID:", founderId);

      // Validate and convert IDs to MongoDB ObjectIDs
      if (
        !mongoose.Types.ObjectId.isValid(investorId) ||
        !mongoose.Types.ObjectId.isValid(founderId)
      ) {
        throw new Error("Invalid ID format");
      }
      const investorObjectId = new ObjectId(investorId);
      const founderObjectId = new ObjectId(founderId);

      // Create progress log object
      const progressLog = {
        date: new Date(date),
        amount: Number(amount),
        notes: note,
        action,
      };

      // Call the saveProgress method
      await investorMethods.saveProgress(
        status,
        investorObjectId,
        founderObjectId,
        progressLog
      );

      return res
        .status(200)
        .json({ message: "Progress successfully submitted!" });
    } catch (e) {
      console.error("Error submitting progress:", e);
      return res
        .status(400)
        .json({ error: "Error in rendering investor progress page" });
    }
  });



router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const userId = req.params.id;
      console.log(userId);
      validation.checkId(userId);
      const investor = await investorMethods.getInvestorFromInvestorById(
        userId
      );
      res.render("investors/profile", { investor });
    } catch (e) {
      return res
        .status(400)
        .json({ error: "error in rendring Investor profile page" });
    }
  })
  .post()
  .put();

export default router;
