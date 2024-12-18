import { Router } from "express";
import { signUpUser, signInUser } from "../controllers/authController.js";
import helper from "../utils/helper.js";
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/user.js';

const router = Router();

router.route("/").get((req, res) => {
    try {
        res.render("landing");
    } catch (e) {
        return res.status(500).json({ error: "Unable to load landing page" });
    }
});

router
    .route("/signup")
    .get((req, res) => {
        try {
            res.render("auth/signup");
        } catch (e) {
            return res.status(500).json({ error: "Unable to load signup page" });
        }
    })
router
    .route("/signup")
    .get((req, res) => {
        res.render("auth/signup", { error: null });
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

            const { signupCompleted, error } = await signUpUser(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.password,
                req.body.phoneCode,
                req.body.phoneNumber,
                req.body.dateOfBirth,
                req.body.userType
            );

            if (signupCompleted) {
                res.redirect("/signin");
            } else {
                // Pass the error message to the view
                res.render("auth/signup", { error: error });
            }
        } catch (e) {
            res.render("auth/signup", { error: e.message });
        }
    });

router
    .route("/signin")
    .get((req, res) => {
        try {
            if (req.session.user) {
                if (req.session.user.userType === "investor") {
                    return res.redirect("/investor/dashboard");
                } else {
                    return res.redirect("/founder/dashboard");
                }
            }
            res.render("auth/signin");
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

            req.session.user = {
                id:user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneCode: user.phoneCode,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                userType: user.userType
            };

            res.cookie("role", user.userType);
            res.cookie("firstName", user.firstName);
            res.cookie("lastName", user.lastName);
            res.cookie("email", user.email);
            res.cookie("id", JSON.stringify(user.id));

            if (user.twoFactorSecret) {
                return res.render("auth/verify-2fa", { email: user.email });
            }

            if (user.userType === "investor") {
                return res.send(`
                    <script>
                        alert("SignIn successful as Investor");
                        window.location.href = "/investor/dashboard";
                    </script>
                `);
            } else {
                return res.send(`
                    <script>
                        alert("SignIn successful as Founder");
                        window.location.href = "/founder/dashboard";
                    </script>
                `);
            }
        } catch (e) {
            return res.status(400).render("auth/signin", { error: e.message });
        }
    });

router
    .route("/verify-2fa")
    .post(async (req, res) => {
        const { email, token } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).render("auth/signin", { error: "User not found" });
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token
            });

            if (verified) {
                req.session.user.twoFactorVerified = true;
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

export default router;
