const fetch = require('node-fetch');
const { Order, OrderItem, Product, Cart, CartItem , ProductImage  } = require('../models');
const commonUtils = require('./commonUtils');
const { getShiprocketToken } = require('../utils/getShiprocketToken');


// Create a new order from the user's cart
async function createOrder(req, res) {
  const userId = req.user.userId;
  if(!req.body) {
    return res.status(404).json({ message: "Product Data is mandatory." });
  }
  const { address } = req.body;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let mobileNumber = req.body.mobileNumber;
  let emailAddress = req.body.emailAddress;
  let fullAddress = req.body.fullAddress;
  let townOrCity = req.body.townOrCity;
  let country = req.body.country;
  let state = req.body.state;
  let pinCode = req.body.pinCode;
  if(!firstName) {
    return res.status(404).json({ message: "First Name is mandatory." });
  }
  if(!lastName) {
    return res.status(404).json({ message: "Last Name is mandatory." });
  }
  if(!mobileNumber) {
    return res.status(404).json({ message: "Mobile Number is mandatory." });
  }
  if(!emailAddress) {
    return res.status(404).json({ message: "Email Address is mandatory." });
  }
  if(!fullAddress) {
    return res.status(404).json({ message: "Full Address is mandatory." });
  }
  if(!townOrCity) {
    return res.status(404).json({ message: "town Or City is mandatory." });
  }
  if(!country) {
    return res.status(404).json({ message: "Country is mandatory." });
  }
  if(!state) {
    return res.status(404).json({ message: "State is mandatory." });
  }
  if(!pinCode) {
    return res.status(404).json({ message: "Pin code is mandatory." });
  }
  if(pinCode) {
    let validatePinCode = commonUtils.isValidIndianPincode(pinCode);
    if(!validatePinCode) {
      return res.status(404).json({ message: "Pin code is invalid." });
    }
    if(validatePinCode && pinCode) {
      let isRealPinCode = commonUtils.isRealPincode(pinCode);
      if(!isRealPinCode) {
        return res.status(404).json({ message: "Pin code is invalid." });
      }
    }
  }
  
  try {
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'products',
          through: { model: CartItem, as: 'cartItem', attributes: ['quantity'] },
        },
      ],
    });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or not found.' });
    }

    const totalAmount = cart.products.reduce((total, product) => {
      const quantity = product.cartItem.quantity;
      return total + parseFloat(product.price) * quantity;
    }, 0);

    const order = await Order.create({
      userId,
      address,
      totalAmount,
      firstName,
      lastName,
      mobileNumber,
      emailAddress,
      fullAddress,
      townOrCity,
      country,
      state,
      pinCode,
    });
    if(!order) {
      return res.status(500).json({ message: 'Failed to create order.' });
    };

    const orderItems = cart.products.map(product => ({
      orderId: order.id,
      productId: product.id,
      quantity: product.cartItem.quantity,
      priceAtPurchase: product.price,
    }));

    await OrderItem.bulkCreate(orderItems);
    await CartItem.destroy({ where: { cartId: cart.id } });

    res.status(201).json({ message: 'Order placed successfully.', orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order.', error: error.message });
  }
}



async function getMyOrders(req, res) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              as: 'product',
              include: [
                {
                  model: ProductImage,
                  as: 'images', // Ensure this matches your model alias
                  attributes: ['imageUrl'], // Only fetch what you need
                },
              ],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
  }
}


// Get a specific order
async function getOrderById(req, res) {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.userId },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order.', error: error.message });
  }
}

// Update order status (e.g., 'paid', 'shipped') — for admin or payment flow
async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated.', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update status.', error: error.message });
  }
}

// Delete an order (if needed)
async function deleteOrder(req, res) {
  try {
    const deleted = await Order.destroy({
      where: { id: req.query.id, userId: req.user.userId },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Order not found or not yours.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order.', error: error.message });
  }
}

//created on 12-06
async function trackOrderStatus(req, res) {
  const userId = req.user?.userId;
  const { orderId } = req.params;

  try {
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid or missing order ID.' });
    }

    const order = await Order.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (!order.shipmentId) {
      return res.status(404).json({ message: 'Shipment not yet created for this order.' });
    }

    const token = await getShiprocketToken();
    const trackUrl = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${order.shipmentId}`;

    const response = await fetch(trackUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000, // optional: 15s timeout
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.message || 'Failed to track shipment';
      throw new Error(`Shiprocket tracking API error [${response.status}]: ${message}`);
    }

    if (!data?.tracking_data || !data.tracking_data.track_url) {
      return res.status(200).json({
        message: 'Tracking information not available yet. Please check back later.',
        tracking: null,
      });
    }

    res.status(200).json({
      message: 'Tracking fetched successfully.',
      tracking: data.tracking_data,
    });
  } catch (err) {
    console.error('Tracking error:', err.message);
    res.status(500).json({
      message: 'Failed to fetch tracking information.',
      error: err.message,
    });
  }
}


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  trackOrderStatus
};
