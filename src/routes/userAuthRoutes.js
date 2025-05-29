// src/routes/userAuthRoutes.js

const express = require('express');
const router = express.Router();
const {
  signupUser,
  signinUser,
  signoutUser,
} = require('../controllers/userAuthController');

router.post('/signup', signupUser);
router.post('/signin', signinUser);
router.post('/signout', signoutUser); 

module.exports = router;