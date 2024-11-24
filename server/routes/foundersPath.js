import { Router } from "express";
import founderMethods from "../controllers/founder/founderData.js";
import validation from "../utils/validation.js";
const router = Router();

router.route("/").get().post().put();

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
    return res.status(400).json({ error: "error in rendring page" });
  }
});

router.route("/getList").get(async (req, res) => {
  try {
    const founders = await founderMethods.getAllFounders();
    return res.status(200).json(founders);
  } catch (e) {
    return res.status(400).json({ error: "unable to fetch data" });
  }
});

export default router;
