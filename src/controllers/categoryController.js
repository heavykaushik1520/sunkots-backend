// src/controllers/categoryController.js

const { Category, Product } = require("../models");

async function createCategory(req, res) {
  try {
    const newCategory = await Category.create(req.body);
    res.status(201).json(newCategory); // 201 Created
  } catch (error) {
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ message: "Failed to create category", error: error.message });
  }
}

// Get all categories
async function getAllCategories(req, res) {
  try {
    const categories = await Category.findAll({
      include: {
        model: Product,
        as: "products",
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching all categories with products:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch categories with products",
        error: error.message,
      });
  }
}

// Get a single category by ID
async function getCategoryById(req, res) {
  const { id } = req.params;
  try {
    const category = await Category.findByPk(id, {
      include: {
        model: Product,
        as: "products",
      },
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to fetch category", error: error.message });
  }
}

// Update an existing category by ID
async function updateCategory(req, res) {
  const { id } = req.params;
  try {
    const [updatedRows] = await Category.update(req.body, {
      where: { id: id },
    });

    if (updatedRows > 0) {
      const updatedCategory = await Category.findByPk(id);
      return res.status(200).json(updatedCategory);
    } else {
      return res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to update category", error: error.message });
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    const deletedRows = await Category.destroy({
      where: { id: id },
    });

    if (deletedRows > 0) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
