import { Router } from "express";
import founderMethods from "../controllers/founder/founderData.js";
import investorMethods from "../controllers/investor/investorData.js";
import helper from "../utils/validation.js";
const router = Router();
router.route("/").get(async (req, res) => {
  try {
    const userType = req.cookies.role;
    let feedData = [];

    if (userType === "founder") {
      feedData = await investorMethods.getAllInvestorDetails();
    } else if (userType === "investor") {
      feedData = await founderMethods.getAllFoundersPosts();
    }

    return res.status(200).json(feedData);
  } catch (e) {
    return res.status(400).json({ error: "Unable to fetch feed data" });
  }
});

export default router;
