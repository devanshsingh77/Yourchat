const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");

// ✅ IMPORT CONTROLLERS CORRECTLY
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

console.log("protect:", protect);
console.log("getMessages:", getMessages);

// ✅ GET MESSAGES
router.get("/:userId", protect, getMessages);

// ✅ SEND MESSAGE
router.post("/", protect, sendMessage);

// ✅ UPLOAD IMAGE
router.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    imageUrl: `/uploads/${req.file.filename}`,
  });
});

module.exports = router;