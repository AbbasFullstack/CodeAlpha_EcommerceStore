const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const createOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: "Cart is empty" });

    const productIds = cart.items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const items = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = productMap.get(cartItem.product.toString());
      if (!product) return res.status(400).json({ success: false, message: "A cart product no longer exists" });
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      items.push({ product: product._id, quantity: cartItem.quantity, price: product.price });
      totalAmount += product.price * cartItem.quantity;
    }

    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) return res.status(409).json({ success: false, message: "Stock changed. Please review your cart and try again." });
    }

    const order = await Order.create({ user: req.user._id, items, totalAmount });
    cart.items = [];
    await cart.save();

    const populated = await Order.findById(order._id).populate("items.product", "name image price");
    res.status(201).json({ success: true, message: "Order created", order: populated });
  } catch (error) { next(error); }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product", "name image").sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) { next(error); }
};

const getOrderById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
    const order = await Order.findById(req.params.id).populate("items.product", "name image price").populate("user", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") return res.status(403).json({ success: false, message: "You cannot access this order" });

    res.json({ success: true, order });
  } catch (error) { next(error); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
    const allowed = ["pending", "processing", "shipped", "delivered"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid order status" });

    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Order status updated", order });
  } catch (error) { next(error); }
};

module.exports = { createOrder, getUserOrders, getOrderById, updateOrderStatus };
