const express = require("express");
const { register, login, getProfile } = require("../controllers/authController");
const protect = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/register", validate({
  name: { required: true, type: "string", minLength: 2, maxLength: 100 },
  email: { required: true, type: "string", email: true, maxLength: 254 },
  password: { required: true, type: "string", minLength: 6, maxLength: 128 },
}), register);

router.post("/login", validate({
  email: { required: true, type: "string", email: true },
  password: { required: true, type: "string", minLength: 6, maxLength: 128 },
}), login);

router.get("/profile", protect, getProfile);

module.exports = router;
