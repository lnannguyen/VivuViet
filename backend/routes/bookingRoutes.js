const express = require("express");
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    updateBookingStatus,
    updateBillSplit,
    cancelBooking,
    completeBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

// Tất cả đều cần đăng nhập
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.put("/:bookingId/status", protect, updateBookingStatus);
router.put("/:bookingId/bill-split", protect, updateBillSplit);
router.put("/:bookingId/cancel", protect, cancelBooking);
router.put("/:bookingId/complete", protect, completeBooking);

module.exports = router;
