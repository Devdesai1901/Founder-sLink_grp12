import { Router } from "express";
import founderMethods from "../controllers/founder/founderData.js";
import validation from "../utils/validation.js";
import helper from "../utils/helper.js";
import Founder from "../models/founder.js";

const router = Router();

//route to just get founder for founder form
router.route("/foundersPofileForm").get(async(req,res) => {
  try{
    const userId = req.session.user.id;
    validation.checkId(userId);
    let uniqueUser = await founderMethods.getFounderById(userId);
    console.log(uniqueUser);
    res.render("founders/founderForm");
  } catch (e){
    return res.status(400).json({ error: "renderings error for founders form"});
  }
}).post( async (req,res)=>{
  try{

    // req.body.startupName = helper.stringVerifyer("Startup Name", req.body.startupName, true, 2, 25);
    // req.body.startupIndustry = helper.stringVerifyer("Startup Industry", req.body.startupName, true, 2, 25);
    // req.body.companyDescription = helper.stringVerifyer("Company Description", req.body.companyDescription, true, 2, 20000);
    // req.body.establishYear = helper.dateOfBirthVerifyer(req.body.establishYear);
    // req.body.fundingStage = req.body.fundingStage;
    // req.body.amountToRaiseFund = req.body.amountToRaiseFund;
    // req.body.tam = req.body.tam;
    // req.body.sam = req.body.sam;
    // req.body.companyReserves = req.body.companyReserves;
    // req.body.website = req.body.website;
    // req.body.linkedIn = req.body.linkedIn;
    // req.body.twitter = req.body.twitter;
    const userId = req.session.user.id;
    validation.checkId(userId);
    const {
      startupName,
      startupIndustry,
      companyDescription,
      establishYear,
      fundingStage,
      amountToRaiseFund,
      tam,
      sam,
      companyReserves,
      website,
      linkedIn,
      twitter,
    } = req.body;

 // Validation
 if (!startupName || typeof startupName !== "string" || startupName.trim() === "") {
  return res.status(400).json({ error: "Startup name is required and must be a string." });
}

if (!startupIndustry || typeof startupIndustry !== "string" || startupIndustry.trim() === "") {
  return res.status(400).json({ error: "Industry is required and must be a string." });
}

if (companyDescription && companyDescription.length > 2000) {
  return res.status(400).json({ error: "Company description cannot exceed 2000 characters." });
}

const currentYear = new Date().getFullYear();
if (!establishYear || isNaN(establishYear) || establishYear < 1800 || establishYear > currentYear) {
  return res.status(400).json({ error: "Year established must be a valid year between 1800 and the current year." });
}

if (!fundingStage || !["Seed", "Series A", "Series B", "IPO"].includes(fundingStage)) {
  return res.status(400).json({ error: "Funding stage is required and must be one of 'Seed', 'Series A', 'Series B', or 'IPO'." });
}

if (!amountToRaiseFund || isNaN(amountToRaiseFund) || amountToRaiseFund <= 0) {
  return res.status(400).json({ error: "Amount to raise must be a valid number greater than 0." });
}

if (tam && (isNaN(tam) || tam < 0)) {
  return res.status(400).json({ error: "Total Addressable Market (TAM) must be a valid number greater than or equal to 0." });
}

if (sam && (isNaN(sam) || sam < 0)) {
  return res.status(400).json({ error: "Serviceable Available Market (SAM) must be a valid number greater than or equal to 0." });
}

if (companyReserves && (isNaN(companyReserves) || companyReserves < 0)) {
  return res.status(400).json({ error: "Company reserves must be a valid number greater than or equal to 0." });
}

// if (website && !isValidURL(website)) {
//   return res.status(400).json({ error: "Website must be a valid URL." });
// }

// if (linkedIn && !isValidURL(linkedIn)) {
//   return res.status(400).json({ error: "LinkedIn must be a valid URL." });
// }

// if (twitter && !isValidURL(twitter)) {
//   return res.status(400).json({ error: "Twitter must be a valid URL." });
// }



const result = await founderMethods.createProfile({ 
  startupName,
  startupIndustry,
  companyDescription,
  establishYear,
  fundingStage,
  amountToRaiseFund,
  tam: tam || null,
  sam: sam || null,
  companyReserves: companyReserves || null,
  website: website || null,
  linkedIn: linkedIn || null,
  twitter: twitter || null,
}, userId);
console.log(result)
    res.status(200).json({
      message: 'User data updated successfully',
      data: result,  
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating user data', error: error.message });
  }
});

// get the all list of users who are founders
router.route("/getList").get(async (req, res) => {
  try {
    const founders = await founderMethods.getAllFounders();
    return res.status(200).json(founders);
  } catch (e) {
    return res.status(400).json({ error: "unable to fetch data" });
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
      if (newpost.poststatus) {
        return res.status(200).json(newpost);
      } else {
        return res.status(400).json({ error: "Unable to save the post" });
      }
    } catch (e) {
      return res.status(400).json({ error: "Unable to upload the post" });
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
