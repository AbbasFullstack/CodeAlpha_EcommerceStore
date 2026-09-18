const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.json({ success: true, cart: cart || { user: req.user._id, items: [] } });
  } catch (error) { next(error); }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const item = cart.items.find((entry) => entry.product.toString() === productId);
    const newQuantity = item ? item.quantity + quantity : quantity;
    if (newQuantity > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} item(s) available` });

    if (item) item.quantity = newQuantity;
    else cart.items.push({ product: productId, quantity });

    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) { next(error); }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart is empty" });

    const before = cart.items.length;
    cart.items = cart.items.filter((entry) => entry.product.toString() !== productId);
    if (cart.items.length === before) return res.status(404).json({ success: false, message: "Product not in cart" });

    await cart.save();
    await cart.populate("items.product");
    res.json({ success: true, message: "Item removed", cart });
  } catch (error) { next(error); }
};

module.exports = { getCart, addToCart, removeFromCart };
