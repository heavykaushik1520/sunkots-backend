// src/controllers/productController.js

const { Product, Category, ProductImage } = require("../models"); // Import from index.js
const { Sequelize } = require("sequelize");

async function createProduct(req, res) {
  try {
    const { images, ...productData } = req.body; // images = array of image URLs

    // Create product
    const newProduct = await Product.create(productData);

    // If images array exists and is an array
    if (Array.isArray(images) && images.length > 0) {
      const imageRecords = images.map((url) => ({
        imageUrl: url,
        productId: newProduct.id,
      }));

      // Bulk create ProductImage records
      await ProductImage.bulkCreate(imageRecords);
    }

    // Fetch product with images and category included
    const productWithImages = await Product.findByPk(newProduct.id, {
      include: [
        { model: Category, as: "category" },
        { model: ProductImage, as: "images" },
      ],
    });

    res.status(201).json(productWithImages);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
}

async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
        },
        { model: ProductImage, as: "images" },
      ],
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
}

// Update an existing product by ID (ADMIN ONLY)
async function updateProduct(req, res) {
  const { id } = req.params;
  try {
    const [updatedRows] = await Product.update(req.body, {
      where: { id: id },
    });
    if (updatedRows > 0) {
      const updatedProduct = await Product.findByPk(id);
      return res.status(200).json(updatedProduct);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
}

// Delete a product by ID (ADMIN ONLY)
async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const deletedRows = await Product.destroy({
      where: { id: id },
    });
    if (deletedRows > 0) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
}

async function searchProductsByName(req, res) {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: "Please provide a search term." });
  }

  try {
    const products = await Product.findAll({
      where: Sequelize.literal(
        `LOWER(products.name) LIKE '%${name.toLowerCase()}%'`
      ),
      include: {
        model: Category,
        as: "category",
      },
    });

    if (products.length === 0) {
      return res.status(404).json({
        message: `No products found matching "${name}"`,
      });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error searching products by name:", error);
    res.status(500).json({
      message: "Failed to search products",
      error: error.message,
    });
  }
}

//pagination
async function getAllProducts(req, res) {
  const { page = 1, limit = 6 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: products } = await Product.findAndCountAll({
      limit: parseInt(limit),
      offset: offset,
      include: [
        { model: Category, as: "category" },
        { model: ProductImage, as: "images" },
      ],
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      products: products,
    });
  } catch (error) {
    console.error("Error fetching all products with pagination:", error);
    res.status(500).json({
      message: "Failed to fetch products with pagination",
      error: error.message,
    });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProductsByName,
};
