console.log(__dirname);
const express = require("express");
const router = express.Router();

// CONTROLLERS
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userController.js");

// MIDDLEWARE
const protect = require("../middleware/authMiddleware");

// ===============================
// PUBLIC ROUTES (NO TOKEN REQUIRED)
// ===============================

// REGISTER USER
router.post("/register", registerUser);

// LOGIN USER
router.post("/login", authUser);

// ===============================
// PROTECTED ROUTES (TOKEN REQUIRED)
// ===============================

// GET ALL USERS
router.get("/", protect, allUsers);

module.exports = router;