const express = require("express");
const router = express.Router();
const {
    createPaymentUrl,
    vnpayReturn,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createPaymentUrl);
router.get("/vnpay-return", vnpayReturn);

module.exports = router;
