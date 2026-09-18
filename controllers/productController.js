const mongoose = require("mongoose");
const Product = require("../models/Product");

const listProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const filter = {};

    if (category) filter.category = category.trim();
    if (search?.trim()) filter.$text = { $search: search.trim() };

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) { next(error); }
};

const getProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) { next(error); }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: "Product created", product });
  } catch (error) { next(error); }
};

const updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product updated", product });
  } catch (error) { next(error); }
};

const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) { next(error); }
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
