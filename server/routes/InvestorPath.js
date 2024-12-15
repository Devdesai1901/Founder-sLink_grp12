import { Router } from "express";
import Investor from './models/investor.js';
import investorMethods from "../controllers/investor/investorData.js";
import validation from "../utils/validation.js";
import mongoose from 'mongoose';
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

//route  to get all the data of Investor from Investor Table
router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const userId = req.params.id;

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

//route  to get all the data of User from User Table
router.route("/dashboard/:id").get(async (req, res) => {
  try {
    const userId = req.params.id;
    validation.checkId(userId);
    let uniqueUser = await investorMethods.getInvestorById(userId);
    res.cookie("role", uniqueUser.userType);
    res.cookie("firstName", uniqueUser.firstName);
    res.cookie("lastName", uniqueUser.lastName);
    uniqueUser._id = uniqueUser._id.toString();
    res.cookie("id", JSON.stringify(uniqueUser._id));

    res.render("common/dashboard");
  } catch (e) {
    return res
      .status(400)
      .json({ error: "error in rendring  investor dashboard page" });
  }
});

// Connect to MongoDB (update your Mongo URI)(Praneeth)
mongoose.connect('mongodb://localhost:27017/yourDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Save Investor Data Route(Praneeth)
router.post('/save-investor', async (req, res) => {
  try {
      const investorData = new Investor(req.body);
      await investorData.save();
      res.status(200).json({ message: 'Investor data saved successfully', data: investorData });
  } catch (err) {
      res.status(500).json({ message: 'Failed to save investor data', error: err });
  }
});

export default router;
