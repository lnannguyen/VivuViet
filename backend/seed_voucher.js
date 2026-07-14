const mongoose = require("mongoose");
require("dotenv").config();
const Voucher = require("./models/Voucher");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        await Voucher.deleteMany({});
        await Voucher.create({
            code: "VIVUVIET2026",
            discount_amount: 200000,
            description: "Giảm 200k cho thành viên mới",
            max_uses: 1000,
            valid_until: new Date("2026-12-31"),
        });
        console.log("Seeded Voucher!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
