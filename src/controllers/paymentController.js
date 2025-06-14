//controllers/paymentController.js
const fetch = require("node-fetch");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Order, OrderItem, Product } = require("../models");
const generateInvoiceBuffer = require("../utils/generateInvoice");
const { getShiprocketToken } = require("../utils/getShiprocketToken");

const dotenv = require("dotenv");
dotenv.config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "artiststation.co.in",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASS,
  },
  tls: {
    // 👇 THIS LINE IS IMPORTANT FOR SELF-SIGNED CERTIFICATE
    rejectUnauthorized: false,
  },
});

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createRazorpayOrder(req, res) {
  const userId = req.user.userId;
  const { orderId } = req.body;

  try {
    if (!orderId) {
      return res
        .status(400)
        .json({ message: "Order ID not found. Please contact support." });
    }

    let order = await Order.findOne({
      where: { id: orderId, userId: userId },
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or does not belong to user." });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Order is not in a pending state for payment." });
    }

    const razorpayAmount = Math.round(parseFloat(order.totalAmount) * 100);

    const options = {
      amount: razorpayAmount,
      currency: "INR",
      receipt: String(order.id),
      payment_capture: 1,
      notes: {
        internal_order_id: String(order.id),
      },
    };

    const razorpayOrder = await instance.orders.create(options);
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      message: "Razorpay order created successfully. Proceed to payment.",
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      message: "Failed to create Razorpay order.",
      error: error.message,
    });
  }
}

async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const webhookSecret = process.env.RAZORPAY_KEY_SECRET;
  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest !== razorpay_signature) {
    console.error("❌ Invalid Razorpay signature.");
    return res
      .status(400)
      .json({ status: "error", message: "Invalid signature." });
  }

  console.log("✅ Payment signature verified.");

  try {
    const order = await Order.findOne({
      where: { razorpayOrderId: razorpay_order_id },
    });
    if (!order) {
      return res
        .status(404)
        .json({ status: "error", message: "Order not found." });
    }

    if (order.status !== "pending") {
      return res
        .status(200)
        .json({ status: "ok", message: "Order already paid." });
    }

    // Mark order as paid
    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    //created on 12/06
    const shipmentResult = await createShiprocketOrder(order);

     if (!shipmentResult || shipmentResult.success === false) {
      console.error("❌ Shiprocket shipment failed:", shipmentResult?.error);
      // Optional: don't block the rest of the flow
    }


    // Fetch order items
    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: Product, as: "product" }],
    });

    // Build product list HTML
    const productTableRows = orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.product.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹${item.priceAtPurchase}</td>
      </tr>
    `
      )
      .join("");

    // Generate PDF invoice
    const invoiceBuffer = await generateInvoiceBuffer(order, orderItems);

    const mailOptions = {
      from: `"Sunkots Order Notifier" <${process.env.ADMIN_EMAIL}>`,
      to: "support@sunkots.com", // ✅ Or use order.emailAddress
      subject: `✅ Order #${order.id} Paid Successfully`,
      text: `
        Order ID: ${order.id}
        Name: ${order.firstName} ${order.lastName}
        Email: ${order.emailAddress}
        Mobile: ${order.mobileNumber}
        Amount Paid: ₹${order.totalAmount}
        Address: ${order.fullAddress}, ${order.townOrCity}, ${order.state} - ${
        order.pinCode
      }, ${order.country}
        Payment ID: ${order.razorpayPaymentId}

        Products:
        ${orderItems
          .map(
            (item) =>
              `- ${item.product.name} (x${item.quantity}) - ₹${item.priceAtPurchase}`
          )
          .join("\n")}

        ✅ Payment has been verified and the order is marked as PAID.
      `,
      html: `
        <h2>🛍️ New Paid Order</h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Name:</strong> ${order.firstName} ${order.lastName}</p>
        <p><strong>Email:</strong> ${order.emailAddress}</p>
        <p><strong>Mobile:</strong> ${order.mobileNumber}</p>
        <p><strong>Amount Paid:</strong> ₹${order.totalAmount}</p>
        <p><strong>Address:</strong><br>
        ${order.fullAddress}, ${order.townOrCity},<br>
        ${order.state} - ${order.pinCode}, ${order.country}</p>
        <p><strong>Payment ID:</strong> ${order.razorpayPaymentId}</p>

        <h3>📦 Ordered Products</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">Product</th>
              <th style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">Quantity</th>
              <th style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${productTableRows}
          </tbody>
        </table>

        <p style="margin-top: 20px;">✅ <strong>Payment has been verified</strong> and the order is now marked as <strong>paid</strong>.</p>
        <p style="font-size: 12px; color: #999;">This is an automated order notification.</p>
      `,
      attachments: [
        {
          filename: `Invoice_Order_${order.id}.pdf`,
          content: invoiceBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📧 Email with invoice sent.");
    } catch (emailErr) {
      console.error("❌ Failed to send email:", emailErr);
    }

    return res.status(200).json({
      status: "ok",
      message: "Payment verified, order updated, and invoice sent.",
    });
  } catch (err) {
    console.error("❌ Error processing order:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error while verifying payment.",
    });
  }
}


//created on 12-06
async function createShiprocketOrder(order) {
  try {
    if (!order || !order.id) {
      throw new Error("Invalid order object provided.");
    }

    const token = await getShiprocketToken();

    // Fetch order items with associated products
    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: Product, as: "product" }],
    });

    if (!orderItems || orderItems.length === 0) {
      throw new Error(`No items found for order ID: ${order.id}`);
    }

    // Construct Shiprocket-compatible items array
    const items = orderItems.map((item) => {
      if (!item.product) {
        throw new Error(`Product not found for order item ID: ${item.id}`);
      }

      return {
        name: item.product.name,
        sku: String(item.product.id),
        units: item.quantity,
        selling_price: parseFloat(item.priceAtPurchase),
      };
    });

    // Validate billing info
    const requiredFields = [
      "firstName",
      "lastName",
      "fullAddress",
      "townOrCity",
      "pinCode",
      "state",
      "country",
      "emailAddress",
      "mobileNumber",
    ];
    for (const field of requiredFields) {
      if (!order[field]) throw new Error(`Missing required field: ${field}`);
    }

    const payload = {
      order_id: String(order.id),
      order_date: new Date().toISOString(),
      pickup_location: "PRIMARY",
      billing_customer_name: order.firstName,
      billing_last_name: order.lastName,
      billing_address: order.fullAddress,
      billing_city: order.townOrCity,
      billing_pincode: String(order.pinCode),
      billing_state: order.state,
      billing_country: order.country,
      billing_email: order.emailAddress,
      billing_phone: String(order.mobileNumber),
      shipping_is_billing: true,
      order_items: items,
      payment_method: "Prepaid",
      sub_total: parseFloat(order.totalAmount),
    };

    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        timeout: 15000, // optional timeout
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const errorMessage =
        result.message || result.error || "Unknown error from Shiprocket.";
      throw new Error(
        `Shiprocket API Error [${response.status}]: ${errorMessage}`
      );
    }

    if (!result.shipment_id) {
      throw new Error(
        `Shiprocket did not return a shipment_id. Response: ${JSON.stringify(
          result
        )}`
      );
    }

    // Save shipment details in your order
    await order.update({
      shipmentId: result.shipment_id,
      awbCode: result.awb || null,
      courierName: result.courier_name || null,
      shipmentStatus: "created",
    });

    return result;
  } catch (err) {
    console.error("Error creating Shiprocket order:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  createShiprocketOrder,
};
