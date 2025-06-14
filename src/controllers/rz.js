// controllers/paymentController.js

const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Order } = require('../models'); // Only need Order model here

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('../config'); // Adjust path as needed
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET'; // Use environment variable

const instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Function to create a Razorpay Order for an existing internal order
async function createRazorpayOrder(req, res) {
  const userId = req.user.userId; // Assuming user is authenticated and userId is available
  const { orderId } = req.body; // Expecting the internal orderId from the frontend

  try {
    // 1. Fetch the internal order from your database
    const order = await Order.findOne({
      where: { id: orderId, userId: userId } // Ensure the order belongs to the current user
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or does not belong to user.' });
    }

    // Ensure the order is in a state ready for payment (e.g., 'pending')
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order is not in a pending state for payment.' });
    }

    // Razorpay amount needs to be in the smallest currency unit (e.g., paisa for INR)
    // totalAmount from your DB is '4.00' (string), so convert to number and multiply by 100
    const razorpayAmount = Math.round(parseFloat(order.totalAmount) * 100);

    // 2. Create Razorpay Order
    const options = {
      amount: razorpayAmount,
      currency: 'INR',
      receipt: String(order.id), // Your internal order ID as receipt
      payment_capture: 1, // Auto capture payment
      notes: {
        internal_order_id: String(order.id), // Add your internal order ID to notes
      },
    };

    const razorpayOrder = await instance.orders.create(options);

    // 3. Update your internal order with the Razorpay Order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // 4. Send Razorpay order details to the frontend
    res.status(200).json({
      message: 'Razorpay order created successfully. Proceed to payment.',
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: RAZORPAY_KEY_ID, // Send key_id to frontend for checkout
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order.', error: error.message });
  }
}

// Function for handling Razorpay Webhook (remains the same)
async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const shasum = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  if (digest === razorpay_signature) {
    console.log('Payment successful & signature verified!');

    try {
      const order = await Order.findOne({ where: { razorpayOrderId: razorpay_order_id } });

      if (order) {
        order.status = 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        res.status(200).json({ status: 'ok', message: 'Payment verified and order updated.' });
      } else {
        console.error('Order not found for Razorpay Order ID:', razorpay_order_id);
        res.status(404).json({ status: 'error', message: 'Order not found.' });
      }
    } catch (error) {
      console.error('Error updating order status after payment verification:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error during order update.' });
    }
  } else {
    console.error('Payment verification failed: Invalid signature!');
    res.status(400).json({ status: 'error', message: 'Invalid signature.' });
  }
}

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};