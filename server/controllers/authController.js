import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import helper from "../utils/helper.js";
import User from '../models/user.js';
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
    firstName = helper.stringVerifyer("First Name", firstName, true, 2, 25);
    lastName = helper.stringVerifyer("Last Name", lastName, true, 2, 25);
    email = helper.emailVerifyer(email);
    password = helper.stringVerifyer("Password", password, false, 8);
    helper.passwordVerifyer(password);
    phoneCode = helper.phoneCodeVerifyer(phoneCode);
    phoneNumber = helper.phoneNumberVerifyer(phoneNumber);
    dateOfBirth = helper.dateOfBirthVerifyer(dateOfBirth);
    userType = helper.validValues("User Type", userType.toLowerCase(), "investor", "founder");

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return { signupCompleted: false, error: "A user with this email already exists." };
    }

    const hash = await bcrypt.hash(password, rounds);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hash,
      phoneCode,
      phoneNumber,
      dateOfBirth,
      userType
    });

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
    email = helper.emailVerifyer(email);
    password = helper.stringVerifyer("Password", password, false, 8);
    helper.passwordVerifyer(password);
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    console.log(user)

    if (!user) {
      throw new Error("Either the email or password is invalid.");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Either the email or password is invalid.");
    }
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

