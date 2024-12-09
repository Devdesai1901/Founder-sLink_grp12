import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Signup user
export const signupUser = async (req, res) => {
  const { firstName, lastName, email, password, userType, phoneCode, phoneNumber, dateOfBirth } = req.body;

  // Password validation
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).render('auth/signup', { error: 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).render('auth/signup', { error: 'User already exists.' });
    }

    // Create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
      phoneCode,
      phoneNumber,
      dateOfBirth,
      verificationToken: jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' }),
    });

    await user.save();

    // Send email verification
    const verifyUrl = `http://localhost:3000/auth/verify/${user.verificationToken}`;
    await transporter.sendMail({
      to: email,
      subject: 'Verify your email',
      text: `Please verify your email by clicking on the following link: ${verifyUrl}`,
    });

    res.status(201).render('auth/signin', { success: 'Signup successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('auth/signup', { error: 'Server error.' });
  }
};

// Signin user
export const signinUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render('auth/signin', { error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('auth/signin', { error: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).render('auth/signin', { error: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).render('auth/signin', { error: 'Server error.' });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).render('auth/signin', { error: 'Invalid token or user not found.' });
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await user.save();

    res.render('auth/signin', { success: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(400).render('auth/signin', { error: 'Invalid or expired token.' });
  }
};
