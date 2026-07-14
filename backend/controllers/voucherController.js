const Voucher = require("../models/Voucher");

// [POST] /api/vouchers/validate - Validate a voucher code
const validateVoucher = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res
                .status(400)
                .json({ message: "Vui lòng cung cấp mã voucher!" });
        }

        const voucher = await Voucher.findOne({ code: code.toUpperCase() });

        if (!voucher) {
            return res
                .status(404)
                .json({ message: "Mã giảm giá không tồn tại!" });
        }

        if (voucher.used_count >= voucher.max_uses) {
            return res
                .status(400)
                .json({ message: "Mã giảm giá đã hết lượt sử dụng!" });
        }

        if (new Date() > new Date(voucher.valid_until)) {
            return res
                .status(400)
                .json({ message: "Mã giảm giá đã hết hạn sử dụng!" });
        }

        res.status(200).json({
            message: "Mã giảm giá hợp lệ!",
            discount_amount: voucher.discount_amount,
            code: voucher.code,
        });
    } catch (error) {
        console.error("Validate voucher error:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

module.exports = {
    validateVoucher,
};
