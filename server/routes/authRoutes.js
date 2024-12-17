import { Router } from "express";
import { signUpUser, signInUser } from "../controllers/authController.js";
import helper from "../utils/helper.js";
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/user.js';


const router = Router();

// Route for landing page (uses layout in views/layouts)
router.route("/").get((req, res) => {
    try {
        res.render("landing"); // Render the `landing.handlebars` file from the layouts folder
    } catch (e) {
        return res.status(500).json({ error: "Unable to load landing page" });
    }
});

// Route for signup
router
    .route("/signup")
    .get((req, res) => {
        try {
            res.render("auth/signup"); // Render the signup view from views/auth
        } catch (e) {
            return res.status(500).json({ error: "Unable to load signup page" });
        }
    })
    .post(async (req, res) => {
        try {
            // Validate input fields
            req.body.firstName = helper.stringVerifyer("First Name", req.body.firstName, true, 2, 25);
            req.body.lastName = helper.stringVerifyer("Last Name", req.body.lastName, true, 2, 25);
            req.body.email = helper.emailVerifyer(req.body.email);
            req.body.password = helper.stringVerifyer("Password", req.body.password, false, 8);
            helper.passwordVerifyer(req.body.password);
            req.body.phoneCode = helper.phoneCodeVerifyer(req.body.phoneCode);
            req.body.phoneNumber = helper.phoneNumberVerifyer(req.body.phoneNumber);
            req.body.dateOfBirth = helper.dateOfBirthVerifyer(req.body.dateOfBirth);
            req.body.userType = helper.validValues("UserType", req.body.userType.toLowerCase(), "investor", "founder");

            // Sign up the user
            const { signupCompleted } = await signUpUser(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.password,
                req.body.phoneCode,
                req.body.phoneNumber,
                req.body.dateOfBirth,
                req.body.userType
            );


                       
            
            // Generate 2FA secret key for the user
            // const secret = speakeasy.generateSecret();
            // const userId = req.body.email;  // Or use a unique user ID from DB
            // // Store the secret in the user's database record
            // await User.updateOne({ email: req.body.email }, { $set: { twoFactorSecret: secret.base32 } });

            // // Generate QR code for the user to scan in their authenticator app
            // const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

            // if (signupCompleted) {
            //     return res.render("auth/verify-2fa", { qrCodeUrl, email: req.body.email }); // Render 2FA verification page
            // } else {
            //     return res.status(500).send("Internal Server Error");
            // }
        } catch (e) {
            return res.status(400).render("auth/signup", { error: e.message }); // Use `auth/signup` path for rendering the signup page
        }
    });

// Route for signin
router
    .route("/signin")
    .get((req, res) => {
        try {
            if (req.session.user) {
                // If the user is already logged in, redirect them to the appropriate dashboard
                if (req.session.user.userType === "investor") {
                    return res.redirect("/investor/dashboard");
                } else {
                    return res.redirect("/founder/dashboard");
                }
            }
            res.render("auth/signin"); // Render the signin view from views/auth
        } catch (e) {
            return res.status(500).json({ error: "Unable to load signin page" });
        }
    })
    .post(async (req, res) => {
        try {
            // Validate user input
            req.body.email = helper.emailVerifyer(req.body.email);
            req.body.password = helper.stringVerifyer("Password", req.body.password, false, 8);
            helper.passwordVerifyer(req.body.password);

            // Attempt to sign in the user
            const user = await signInUser(req.body.email, req.body.password);

            // Store user information in session
            req.session.user = {
                id:user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneCode: user.phoneCode,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                userType: user.userType // Store the user type to redirect them accordingly
            };
            

            //Adding Cookies
            res.cookie("role", user.userType);
            res.cookie("firstName", user.firstName);
            res.cookie("lastName", user.lastName);
            res.cookie("email", user.email);
            res.cookie("id", JSON.stringify(user.id));
            console.log(res.cookie);
            // Check if user has 2FA enabled
            if (user.twoFactorSecret) {
                return res.render("auth/verify-2fa", { email: user.email }); // Prompt user for 2FA verification
            }

            // Redirect based on the user type (Investor or Founder)
            if (user.userType === "investor") {
                return res.redirect("/investor/dashboard");
            } else {
                return res.redirect("/founder/dashboard");
            }
        } catch (e) {
            return res.status(400).render("auth/signin", { error: e.message }); // Use `auth/signin` path for rendering the signin page
        }
    });

// Route for verifying 2FA token
router
    .route("/verify-2fa")
    .post(async (req, res) => {
        const { email, token } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).render("auth/signin", { error: "User not found" });
            }

            // Verify the token using speakeasy
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token
            });

            if (verified) {
                req.session.user.twoFactorVerified = true; // Mark 2FA as verified in the session
                if (user.userType === "investor") {
                    return res.redirect("/investor/dashboard");
                } else {
                    return res.redirect("/founder/dashboard");
                }
            } else {
                return res.status(400).render("auth/verify-2fa", { error: "Invalid 2FA token", email });
            }
        } catch (e) {
            return res.status(500).render("auth/verify-2fa", { error: "Unable to verify 2FA" });
        }
    });

// Route for signout
router.route("/signout").get((req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error signing out.");
        }
        res.redirect("/signin"); // Redirect to sign-in page after logging out
    });
});

export default router;