// src/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware'); // Import isAdmin middleware
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProductsByName
} = require('../controllers/productController');

// Public routes
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
// router.get('/products/search', searchProductsByName);

// Admin-only routes
router.post('/products', isAdmin, createProduct);
router.put('/products/:id', isAdmin, updateProduct);
router.delete('/products/:id', isAdmin, deleteProduct);

module.exports = router;