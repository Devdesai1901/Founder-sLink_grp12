import { Router } from "express";
import investorMethods from "../controllers/investor/investorData.js";
import validation from "../utils/validation.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
const router = Router();

router
  .route("/investorProfileForm")
  .get(async (req, res) => {
    try {
      res.render("investors/investorForm");
    } catch (e) {
      return res
        .status(400)
        .json({ error: "renderings error for investor form" });
    }
  })
  .post(async (req, res) => {
    try {
      const userId = req.session.user.id;
      validation.checkId(userId);

      const {
        investorType,
        investmentPreferences,
        contactInformation,
        socialLinks,
        performanceMetrics,
        description,
      } = req.body;

      // Validate required fields
      if (
        !investorType ||
        !investmentPreferences ||
        !investmentPreferences.industries ||
        !investmentPreferences.minimumInvestmentAmount ||
        !contactInformation ||
        !contactInformation.phone ||
        !contactInformation.email
      ) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Validate investorType
      const validInvestorTypes = [
        "Angel",
        "Venture Capitalist",
        "Private Equity",
        "Family Office",
        "Corporate",
      ];
      if (!validInvestorTypes.includes(investorType)) {
        return res.status(400).json({ error: "Invalid investor type." });
      }

      // Validate industries
      const validIndustries = [
        "Technology",
        "Healthcare",
        "Finance",
        "Education",
        "Energy",
        "Retail",
        "Agriculture",
        "Transportation",
        "Entertainment",
        "Real Estate",
      ];
      for (const industry of investmentPreferences.industries) {
        if (!validIndustries.includes(industry)) {
          return res
            .status(400)
            .json({ error: `Invalid industry: ${industry}` });
        }
      }

      // Validate minimumInvestmentAmount
      if (
        isNaN(investmentPreferences.minimumInvestmentAmount) ||
        investmentPreferences.minimumInvestmentAmount <= 0
      ) {
        return res.status(400).json({
          error: "Minimum investment amount must be a positive number.",
        });
      }

      // Validate preferredStartupSize
      const validStartupSizes = ["Small", "Medium", "Large"];
      if (
        investmentPreferences.preferredStartupSize &&
        !validStartupSizes.includes(investmentPreferences.preferredStartupSize)
      ) {
        return res
          .status(400)
          .json({ error: "Invalid preferred startup size." });
      }

      // Validate contactInformation
      if (!contactInformation.phone || !contactInformation.email) {
        return res.status(400).json({
          error: "Phone and email are required in contact information.",
        });
      }

      // Create the profile
      const newProfile = {
        userId,
        investorType,
        investmentPreferences: {
          industries: investmentPreferences.industries,
          fundingStages: investmentPreferences.fundingStages || [],
          geographicPreferences:
            investmentPreferences.geographicPreferences || [],
          minimumInvestmentAmount: parseFloat(
            investmentPreferences.minimumInvestmentAmount
          ),
          preferredStartupSize:
            investmentPreferences.preferredStartupSize || null,
        },
        contactInformation: {
          phone: contactInformation.phone,
          email: contactInformation.email,
          preferredContactMethod:
            contactInformation.preferredContactMethod || null,
        },
        socialLinks: {
          website: socialLinks.website || null,
          linkedIn: socialLinks.linkedIn || null,
          twitter: socialLinks.twitter || null,
          personalBlog: socialLinks.personalBlog || null,
        },
        performanceMetrics: {
          totalInvested: performanceMetrics.totalInvested || 0,
          returnsGenerated: performanceMetrics.returnsGenerated || 0,
          activeDeals: performanceMetrics.activeDeals || 0,
          portfolioValue: performanceMetrics.portfolioValue || 0,
        },
        description: description || "",
      };

      const result = await investorMethods.createProfile(newProfile, userId);

      res.status(200).json({
        message: "Investor profile created successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        message: "Error creating investor profile",
        error: error.message,
      });
    }
  });

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
