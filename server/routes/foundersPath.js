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

// route to just get the Founders Data from Founders Table
router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const userId = req.params.id;
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

// route to just get the User data from User Table
router.route("/dashboard/:id").get(async (req, res) => {
  try {
    const userId = req.params.id;
    validation.checkId(userId);
    const uniqueUser = await founderMethods.getFounderById(userId);
    res.cookie("role", uniqueUser.userType);
    res.cookie("firstName", uniqueUser.firstName);
    res.cookie("lastName", uniqueUser.lastName);
    res.render("common/dashboard");
  } catch (e) {
    return res
      .status(400)
      .json({ error: "error in rendring founder dashboard page" });
  }
});

export default router;
