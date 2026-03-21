const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserById,
  getAllUsers,
} = require("../controller/userController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);

module.exports = router;
