const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true },
        discount_amount: { type: Number, required: true },
        description: { type: String },
        max_uses: { type: Number, default: 100 },
        used_count: { type: Number, default: 0 },
        valid_until: { type: Date, required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Voucher", voucherSchema);
