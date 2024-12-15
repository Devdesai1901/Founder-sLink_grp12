import { Router } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import Founder from "./models/founder.js";
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
    let uniqueUser = await founderMethods.getFounderById(userId);
    res.cookie("role", uniqueUser.userType);
    res.cookie("firstName", uniqueUser.firstName);
    res.cookie("lastName", uniqueUser.lastName);
    res.cookie("email", uniqueUser.email);

    uniqueUser._id = String(uniqueUser._id);
    res.cookie("id", JSON.stringify(uniqueUser._id));
    res.render("common/dashboard");
  } catch (e) {
    return res
      .status(400)
      .json({ error: "error in rendring founder dashboard page" });
  }
});

//Start code for updating fouders form data(Praneeth)
const app = express();
const PORT = 5000;

mongoose.connect('mongodb://localhost:27017/startupdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/update-founder', async (req, res) => {
    try {
        const founderData = req.body;
        await Founder.create(founderData);
        res.status(200).send('Founder information saved successfully.');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
//end

export default router;
