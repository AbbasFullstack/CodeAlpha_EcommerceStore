const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ success: false, message: "Email is already registered" });

    const user = await User.create({ name, email, password });
    const token = createToken(user);
    res.status(201).json({ success: true, message: "Registration successful", token, user: publicUser(user) });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user);
    res.json({ success: true, message: "Login successful", token, user: publicUser(user) });
  } catch (error) { next(error); }
};

const getProfile = async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
};

module.exports = { register, login, getProfile };
