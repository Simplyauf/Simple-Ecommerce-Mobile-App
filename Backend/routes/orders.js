const express = require("express");
const router = express.Router();
const { auth, admin } = require("../../Backend/middleware/auth");
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/", auth, createOrder);
router.get("/", auth, getOrders);
router.get("/:id", auth, getOrder);
router.patch("/:id/status", [auth], updateOrderStatus);

module.exports = router;
