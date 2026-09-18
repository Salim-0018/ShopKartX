const crypto = require("crypto");
const Razorpay = require("razorpay");

const orderModel = require("../models/orderModel");
const { pool } = require("../config/database");

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials are not configured in backend .env"
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

async function getOrders(req, res) {
  try {
    const orders = await orderModel.getOrders(req.query);

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
}

async function getOrder(req, res) {
  try {
    const order = await orderModel.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
}

async function getStats(req, res) {
  try {
    const stats = await orderModel.getOrderStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Order stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
    });
  }
}

async function createOrder(req, res) {
  try {
    const {
      order_number,
      customer_name,
      customer_email,
      subtotal,
      total_amount,
      shipping_address,
    } = req.body;

    if (
      !order_number ||
      !customer_name ||
      !customer_email ||
      subtotal === undefined ||
      total_amount === undefined ||
      !shipping_address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "order_number, customer_name, customer_email, subtotal, total_amount and shipping_address are required",
      });
    }

    const existingOrders = await orderModel.getOrders({
      search: order_number,
      limit: 1,
    });

    if (
      existingOrders.some(
        (order) => order.order_number === order_number
      )
    ) {
      return res.status(409).json({
        success: false,
        message: "Order number already exists",
      });
    }

    const order = await orderModel.createOrder(req.body);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
}

async function updateStatus(req, res) {
  try {
    const allowedStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED",
      "REFUND_PENDING",
      "REFUNDED",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await orderModel.updateOrderStatus(
      req.params.id,
      status
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
}

async function updatePayment(req, res) {
  try {
    const allowedStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const order = await orderModel.updatePaymentStatus(
      req.params.id,
      status
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update payment status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
    });
  }
}

async function createRazorpayOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await orderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.payment_status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    if (order.payment_method !== "RAZORPAY") {
      return res.status(400).json({
        success: false,
        message: "Order payment method is not RAZORPAY",
      });
    }

    const amount = Number(order.total_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const razorpay = getRazorpayClient();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: String(order.order_number).slice(0, 40),
      notes: {
        shopkartx_order_id: String(order.id),
        shopkartx_order_number: String(order.order_number),
      },
    });

    await pool.query(
      `
        UPDATE orders
        SET
          razorpay_order_id = ?,
          payment_status = 'PENDING'
        WHERE id = ?
      `,
      [razorpayOrder.id, order.id]
    );

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        shopkartx_order_id: order.id,
        shopkartx_order_number: order.order_number,
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        amount_in_rupees: amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
}

async function verifyRazorpayPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }

    const [orders] = await pool.query(
      `
        SELECT *
        FROM orders
        WHERE razorpay_order_id = ?
        LIMIT 1
      `,
      [razorpay_order_id]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "ShopKartX order not found for this Razorpay order",
      });
    }

    const order = orders[0];

    if (order.payment_status === "PAID") {
      return res.json({
        success: true,
        message: "Payment is already verified",
        data: {
          order_id: order.id,
          order_number: order.order_number,
          payment_status: order.payment_status,
        },
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error(
        "RAZORPAY_KEY_SECRET is not configured"
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const receivedSignatureBuffer = Buffer.from(
      String(razorpay_signature),
      "utf8"
    );

    const generatedSignatureBuffer = Buffer.from(
      generatedSignature,
      "utf8"
    );

    const signatureValid =
      receivedSignatureBuffer.length ===
        generatedSignatureBuffer.length &&
      crypto.timingSafeEqual(
        receivedSignatureBuffer,
        generatedSignatureBuffer
      );

    if (!signatureValid) {
      await pool.query(
        `
          UPDATE orders
          SET payment_status = 'FAILED'
          WHERE id = ?
        `,
        [order.id]
      );

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    await pool.query(
      `
        UPDATE orders
        SET
          razorpay_payment_id = ?,
          razorpay_signature = ?,
          payment_status = 'PAID'
        WHERE id = ?
      `,
      [
        razorpay_payment_id,
        razorpay_signature,
        order.id,
      ]
    );

    const updatedOrder =
      await orderModel.getOrderById(order.id);

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to verify Razorpay payment",
    });
  }
}

module.exports = {
  getOrders,
  getOrder,
  getStats,
  createOrder,
  updateStatus,
  updatePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
