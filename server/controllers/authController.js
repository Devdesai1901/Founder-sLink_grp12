import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import helper from "../utils/helper.js";
import User from "../models/user.js";
dotenv.config();

const rounds = 12;

export const signUpUser = async (
  firstName,
  lastName,
  email,
  password,
  phoneCode,
  phoneNumber,
  dateOfBirth,
  userType
) => {
  try {
    // Validate inputs using helper functions
    firstName = helper.stringVerifyer("First Name", firstName, true, 2, 25);
    lastName = helper.stringVerifyer("Last Name", lastName, true, 2, 25);
    email = helper.emailVerifyer(email);
    password = helper.stringVerifyer("Password", password, false, 8);
    helper.passwordVerifyer(password);
    phoneCode = helper.phoneCodeVerifyer(phoneCode);
    phoneNumber = helper.phoneNumberVerifyer(phoneNumber);
    dateOfBirth = helper.dateOfBirthVerifyer(dateOfBirth);
    userType = helper.validValues(
      "User Type",
      userType.toLowerCase(),
      "investor",
      "founder"
    );

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error(`A user with this email already exists.`);
    }

    // Hash the password
    const hash = await bcrypt.hash(password, rounds);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hash,
      phoneCode,
      phoneNumber,
      dateOfBirth,
      userType,
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    if (!savedUser) {
      throw new Error("Could not add user.");
    }

    return { signupCompleted: true };
  } catch (error) {
    throw new Error(`Error during signup: ${error.message}`);
  }
};

// Signin User
export const signInUser = async (email, password) => {
  try {
    // Validate inputs using helper functions
    email = helper.emailVerifyer(email);
    password = helper.stringVerifyer("Password", password, false, 8);
    helper.passwordVerifyer(password);

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Either the email or password is invalid.");
    }

    // Compare the provided password with the stored hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Either the email or password is invalid.");
    }

    // Return user details (excluding sensitive data like password)
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneCode: user.phoneCode,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      userType: user.userType,
    };
  } catch (error) {
    throw new Error(`Error during signin: ${error.message}`);
  }
};
