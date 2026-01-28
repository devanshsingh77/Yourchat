const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/userControllers");

const { protect } = require("../middleware/authMiddleware");

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// GET LOGGED IN USER
router.get("/me", protect, getMe);

module.exports = router;
