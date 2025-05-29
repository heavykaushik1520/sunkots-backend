// src/controllers/userAuthController.js

const { User , Cart } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signupUser(req, res) {
  try {
    const newUser = await User.create(req.body);
    // You might want to omit the password from the response for security
    await Cart.create({ userId: newUser.id });
    const { password, ...userWithoutPassword } = newUser.get();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error signing up user:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email or phone number already exists.' });
    }
    res.status(500).json({ message: 'Failed to create user.', error: error.message });
  }
}

async function signinUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Sign in successful!', token });
  } catch (error) {
    console.error('Error signing in user:', error);
    res.status(500).json({ message: 'Failed to sign in.', error: error.message });
  }
}


async function signoutUser(req, res) {
  
  res.status(200).json({ message: 'Sign out successful!' });
}

module.exports = {
  signupUser,
  signinUser,
  signoutUser,
};