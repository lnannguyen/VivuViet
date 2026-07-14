const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // Sử dụng mã review làm _id (REV001...)
        booking_id: { type: String, ref: "Booking", required: true },
        user_id: { type: String, ref: "User", required: true },
        tour_id: { type: String, ref: "Tour", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        images: [{ type: String }], // Danh sách ảnh thực tế đính kèm
        videos: [{ type: String }], // Danh sách video thực tế đính kèm
    },
    { timestamps: true, _id: false },
);

module.exports = mongoose.model("Review", reviewSchema);
