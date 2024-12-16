import { Router } from "express";
import investorMethods from "../controllers/investor/investorData.js";
import validation from "../utils/validation.js";
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

//route to get investor for investor form
router.route("/investorsPofileForm").get(async(req,res) => {
  try{
    const userId = req.session.user.id;
    validation.checkId(userId);
    let uniqueUser = await founderMethods.getFounderById(userId);
    console.log(uniqueUser);
    res.render("investor/investorForm");
  } catch (e){
    return res.status(400).json({ error: "rendering error for investor form"});
  }
});

//route  to get all the data of Investor from Investor Table
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
