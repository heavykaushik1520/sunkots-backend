const express = require('express');
const router = express.Router();

const { isUser} = require('../middleware/userAuthMiddleware');

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  trackOrderStatus
} = require("../controllers/orderController");

router.post("/order", isUser, createOrder);
router.get("/order", isUser, getMyOrders);
router.delete("/order", isUser , deleteOrder);
router.get("/order/:id", isUser, getOrderById);

//created on 12-06
router.get('/track/:orderId', isUser, trackOrderStatus);


module.exports = router;

