const express = require("express");
const router = express.Router();
const {
    getTourReviews,
    createReview,
    getRecentReviews,
    getReviewByBooking,
    getUserReviews
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đảm bảo thư mục tồn tại
const imagesDir = path.join(__dirname, "../../frontend/assets/images/reviews/");
const videosDir = path.join(__dirname, "../../frontend/assets/videos/reviews/");
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'videos') {
            cb(null, videosDir);
        } else {
            cb(null, imagesDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "review-" + uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

router.get("/recent", getRecentReviews); // Public: xem reviews mới nhất
router.get("/tour/:tourId", getTourReviews); // Public: xem reviews của tour
router.get("/user/me", protect, getUserReviews); // Protected: xem reviews của user
router.get("/booking/:bookingId", protect, getReviewByBooking); // Protected: xem review theo booking
router.post("/", protect, upload.fields([
    { name: 'images', maxCount: 3 },
    { name: 'videos', maxCount: 2 }
]), createReview); // Protected: gửi review

module.exports = router;
