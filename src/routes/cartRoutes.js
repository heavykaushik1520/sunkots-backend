// src/routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const { isUser } = require('../middleware/userAuthMiddleware');
const {
  getMyCart,
  updateMyCart,
  deleteCartItem,
  clearMyCart,
} = require('../controllers/cartController');

// Routes for the logged-in user's cart
router.get('/cart', isUser, getMyCart);        
router.post('/cart', isUser, updateMyCart);    
router.delete('/cart/:productId', isUser, deleteCartItem); 
router.delete('/cart', isUser, clearMyCart);    
module.exports = router;