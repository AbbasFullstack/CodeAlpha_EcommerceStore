const express = require("express");
const { getCart, addToCart, removeFromCart } = require("../controllers/cartController");
const protect = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(protect);
router.get("/", getCart);
router.post("/add", validate({
  productId: { required: true, type: "string" },
  quantity: { type: "number", integer: true },
}), addToCart);
router.delete("/remove/:productId", removeFromCart);

module.exports = router;
