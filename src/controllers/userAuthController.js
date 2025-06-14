// src/controllers/userAuthController.js

const { User, Cart } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

async function signupUser(req, res) {
  try {
    const newUser = await User.create(req.body);
    // You might want to omit the password from the response for security
    await Cart.create({ userId: newUser.id });
    const { password, ...userWithoutPassword } = newUser.get();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error signing up user:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Email or phone number already exists." });
    }
    res
      .status(500)
      .json({ message: "Failed to create user.", error: error.message });
  }
}

async function signinUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Sign in successful!", token });
  } catch (error) {
    console.error("Error signing in user:", error);
    res
      .status(500)
      .json({ message: "Failed to sign in.", error: error.message });
  }
}

async function signoutUser(req, res) {
  res.status(200).json({ message: "Sign out successful!" });
}

async function getCurrentUser(req, res) {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ["id", "firstname", "lastname", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Failed to fetch user." });
  }
}

// POST /refresh-token
function refreshToken(req, res) {
  try {
    const payload = {
      userId: req.user.userId,
      role: req.user.role,
    };

    const newToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_secret_key",
      {
        expiresIn: "10m", // match your session timeout policy
      }
    );

    return res.status(200).json({ token: newToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ message: "Failed to refresh token." });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    user.reset_token = token;
    user.reset_token_expires = expires;
    await user.save();

    const resetLink = `http://localhost:5173/sotrue/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // 👇 This line is critical
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"Sunkots Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    });

    res.json({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
}

async function resetPassword(req, res) {
  if (!req.body || !req.body.token || !req.body.newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required." });
  }
  const { token, newPassword } = req.body;

  console.log("resetPassword req.body:", req.body);

  try {
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: {
          [require("sequelize").Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.password = newPassword; // Hook will hash it
    user.reset_token = null;
    user.reset_token_expires = null;

    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Failed to reset password." });
  }
}

module.exports = {
  signupUser,
  signinUser,
  signoutUser,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  resetPassword,
};
