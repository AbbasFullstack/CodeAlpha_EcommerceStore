require("dotenv").config();

const connectDB = require("./config/db");
const Product = require("./models/Product");

const products = [
  {
    name: "Wireless Headphones",
    description: "Comfortable over-ear wireless headphones with clear sound and long battery life.",
    price: 7499,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
    stock: 25,
  },
  {
    name: "Smart Watch",
    description: "Modern smartwatch with activity tracking, notifications, and a bright touch display.",
    price: 9999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
    stock: 18,
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes designed for comfortable everyday training and walking.",
    price: 6499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    category: "Fashion",
    stock: 30,
  },
  {
    name: "Classic Backpack",
    description: "Durable everyday backpack with a spacious main compartment and laptop sleeve.",
    price: 3999,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    category: "Accessories",
    stock: 22,
  },
  {
    name: "Minimal Desk Lamp",
    description: "Clean modern desk lamp for focused work, study, and comfortable ambient lighting.",
    price: 2899,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    stock: 15,
  },
  {
    name: "Mechanical Keyboard",
    description: "Compact mechanical keyboard with tactile switches and a comfortable typing layout.",
    price: 8499,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
    stock: 12,
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Simple reusable ceramic mug suitable for coffee, tea, and everyday home or office use.",
    price: 1499,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    stock: 40,
  },
  {
    name: "Cotton Hoodie",
    description: "Soft everyday cotton hoodie with a relaxed fit for casual wear and cool evenings.",
    price: 4499,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    category: "Fashion",
    stock: 20,
  },
];

const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products successfully.`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  }
};

seed();
