const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");

// Public route: everyone can validate a voucher
router.post("/validate", voucherController.validateVoucher);

module.exports = router;
