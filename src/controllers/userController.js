// src/controllers/userController.js

const { User , Cart } = require("../models");

async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Exclude password for security
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch users.", error: error.message });
  }
}

async function getUserByMe(req, res) {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Cart,
          as: 'cart', // Use the alias you defined in the User model
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user.", error: error.message });
  }
}

async function updateUserMe(req, res) {
  try {
    const [updatedRows] = await User.update(req.body, {
      where: { id: req.user.userId },
    });

    if (updatedRows > 0) {
      const updatedUser = await User.findByPk(req.user.userId, {
        attributes: { exclude: ["password"] },
      });
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Failed to update user.", error: error.message });
  }
}

async function deleteUserMe(req, res) {
  try {
    const deletedRows = await User.destroy({
      where: { id: req.user.userId },
    });

    if (deletedRows > 0) {
      return res.status(204).send(); // 204 No Content
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user.", error: error.message });
  }
}

module.exports = {
  getAllUsers,
  getUserByMe,
  updateUserMe,
  deleteUserMe,
};
