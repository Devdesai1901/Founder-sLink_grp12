import { Router } from "express";
import { signUpUser, signInUser} from "../controllers/authController.js";
import helper from "../utils/helper.js";


const router = Router();

// Route for landing page
router
    .route("/")
    .get((req, res) => {
      try {
        res.render("landing"); // Render the `landing.handlebars` file from the views folder
      } catch (e) {
        return res.status(500).json({ error: "Unable to load landing page" });
      }
    });

// Route for signup
router
    .route("/signup")
    .get((req, res) => {
      try {
        res.render("signup");
      } catch (e) {
        return res.status(500).json({ error: "Unable to load signup page" });
      }
    })
    .post(async (req, res) => {
      try {
        req.body.firstName = helper.stringVerifyer("First Name", req.body.firstName, true, 2, 25);
        req.body.lastName = helper.stringVerifyer("Last Name", req.body.lastName, true, 2, 25);
        req.body.email = helper.emailVerifyer(req.body.email);
        req.body.password = helper.stringVerifyer("Password", req.body.password, false, 8);
        helper.passwordVerifyer(req.body.password);
        req.body.phoneCode = helper.phoneCodeVerifyer(req.body.phoneCode);
        req.body.phoneNumber = helper.phoneNumberVerifyer(req.body.phoneNumber);
        req.body.dateOfBirth = helper.dateOfBirthVerifyer(req.body.dateOfBirth);
        req.body.userType = helper.validValues("UserType", req.body.userType.toLowerCase(), "investor", "founder");
  
        const {signupCompleted} = await signUpUser(req.body.firstName, req.body.lastName, req.body.email, req.body.password,
          req.body.phoneCode, req.body.phoneNumber, req.body.dateOfBirth, req.body.userType);
        if(signupCompleted) {
          return res.redirect("/signin");
        }
        else {
          return res.status(500).send("Internal Server Error");
        }
      } catch (e) {
        return res.status(400).render("signup", {error: e.message});
      }
    });

// Route for signin
router
    .route("/signin")
    .get((req, res) => {
      try {
        res.render("signin");
      } catch (e) {
        return res.status(500).json({ error: "Unable to load signin page" });
      }
    })
    .post(async (req, res) => {
      try {
        req.body.email = helper.emailVerifyer(req.body.email);
        req.body.password = helper.stringVerifyer("Password", req.body.password, false, 8);
        helper.passwordVerifyer(req.body.password);
  
        const user = await signInUser(req.body.email, req.body.password);
  
        req.session.user = { firstName: user.firstName, lastName: user.lastName, email: user.email, phoneCode: user.phoneCode, phoneNumber: user.phoneNumber, dateOfBirth: user.dateOfBirth };
  
        if(user.userType === "investor") {
          return res.redirect("/investor/dashboard");
        }
        else {
          return res.redirect("/founder/dashboard");
        }
      } catch (e) {
        return res.status(400).render("signin", {error: e.message});
      }
    });

export default router;
