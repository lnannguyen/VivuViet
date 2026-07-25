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

const os = require("os");

const upload = multer({ dest: os.tmpdir() });

router.get("/recent", getRecentReviews); // Public: xem reviews mới nhất
router.get("/tour/:tourId", getTourReviews); // Public: xem reviews của tour
router.get("/user/me", protect, getUserReviews); // Protected: xem reviews của user
router.get("/booking/:bookingId", protect, getReviewByBooking); // Protected: xem review theo booking
router.post("/", protect, upload.fields([
    { name: 'images', maxCount: 3 },
    { name: 'videos', maxCount: 2 }
]), createReview); // Protected: gửi review

module.exports = router;
