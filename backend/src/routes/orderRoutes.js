const express = require("express");
const controller = require("../controllers/orderController");

const router = express.Router();

// Order statistics
router.get("/stats", controller.getStats);

// Razorpay payment routes
router.post(
  "/:id/payment/razorpay/create",
  controller.createRazorpayOrder
);

router.post(
  "/payment/razorpay/verify",
  controller.verifyRazorpayPayment
);

// Orders
router.get("/", controller.getOrders);

router.get("/:id", controller.getOrder);

router.post("/", controller.createOrder);

router.patch("/:id/status", controller.updateStatus);

router.patch("/:id/payment", controller.updatePayment);

module.exports = router;
