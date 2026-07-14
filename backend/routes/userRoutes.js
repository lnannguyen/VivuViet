const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../frontend/assets/images/avt/"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// Route cập nhật profile (yêu cầu đăng nhập)
router.put("/profile", protect, userController.updateProfile);

// Route upload avatar
router.post(
    "/profile/avatar",
    protect,
    upload.single("avatar"),
    userController.uploadAvatar,
);

// Route đổi điểm
router.post("/redeem-points", protect, userController.redeemPoints);

module.exports = router;
