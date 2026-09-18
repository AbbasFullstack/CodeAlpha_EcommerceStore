const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    price: {
      type: Number,
      required: [true, "Item price is required"],
      min: [0, "Item price cannot be negative"],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order must contain at least one item"],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Total amount must be a valid number",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "processing", "shipped", "delivered"],
        message: "Invalid order status",
      },
      default: "pending",
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
