import express from 'express';
import { signupUser, signinUser, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

// Route for landing page
router.get('/', (req, res) => {
  res.render('landing'); // Render the `landing.handlebars` file from the views folder
});

// Route for signup
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});
router.post('/signup', signupUser);

// Route for signin
router.get('/signin', (req, res) => {
  res.render('auth/signin');
});
router.post('/signin', signinUser);

// Route for email verification
router.get('/auth/verify/:token', verifyEmail);

export default (app) => {
  app.use('/auth', router);
};
