const express = require("express");
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    toggleWishlist,
    markNotificationRead,
    validateVoucher,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (cần token)
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/wishlist", protect, toggleWishlist);
router.put("/notifications/:notifId/read", protect, markNotificationRead);
router.post("/voucher/validate", protect, validateVoucher);

module.exports = router;
