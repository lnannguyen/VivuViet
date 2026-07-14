const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        passport_cccd: { type: String, required: true },
    },
    { _id: false },
);

const billSplitSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String },
        amount: { type: Number, required: true },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
    },
    { _id: false },
);

const bookingSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // Sử dụng mã booking làm _id (BK001...)
        user_id: { type: String, ref: "User", required: true },
        tour_id: { type: String, ref: "Tour", required: true },
        departure_date: { type: Date, required: true },
        quantity: { type: Number, required: true },
        passengers: [passengerSchema],

        total_price: { type: Number, required: true }, // Giá tour gốc nhân với số khách
        service_fee: { type: Number, default: 0 },
        voucher_code: { type: String },
        discount_amount: { type: Number, default: 0 },
        final_price: { type: Number, required: true }, // Số tiền cuối cùng cần thanh toán

        bill_split: [billSplitSchema], // Bảng chia chi phí theo từng thành viên nhóm
        booking_status: {
            type: String,
            enum: ["pending", "paid", "cancelled", "completed"],
            default: "pending",
        },
        isReviewed: { type: Boolean, default: false },
        payment_method: {
            type: String,
            enum: ["bank_transfer", "vnpay", "momo", "card"],
            default: "bank_transfer",
        },
    },
    { timestamps: true, _id: false },
);

module.exports = mongoose.model("Booking", bookingSchema);
