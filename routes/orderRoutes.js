const express = require("express");
const { createOrder, getUserOrders, getOrderById, updateOrderStatus } = require("../controllers/orderController");
const protect = require("../middleware/auth");
const adminOnly = require("../middleware/admin");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(protect);
router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", adminOnly, validate({
  status: { required: true, type: "string" },
}), updateOrderStatus);

module.exports = router;
