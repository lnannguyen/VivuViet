const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, default: "info" }, // e.g. booking, achievement, point, general
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true },
    discount_amount: { type: Number, required: true },
    discount_type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "fixed",
    },
    min_spend: { type: Number, default: 0 },
    expiry_date: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
});

const passportStampSchema = new mongoose.Schema({
    location: { type: String, required: true },
    image: { type: String, default: "" },
    visitCount: { type: Number, default: 1 },
    firstVisitDate: { type: Date, default: Date.now },
    lastVisitDate: { type: Date, default: Date.now },
});

const achievementSchema = new mongoose.Schema({
    label: { type: String, required: true },
    icon: { type: String, default: "bi-trophy-fill" },
    color: { type: String, default: "#F97316" },
    unlockedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // Sử dụng mã khách hàng làm _id (CUS001...)
        fullname: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
        dob: { type: Date },
        gender: { type: String, enum: ["male", "female", "other"] },
        address: { type: String },
        avatar: { type: String, default: "" },
        password: { type: String, required: true },
        auth_provider: {
            type: String,
            enum: ["local", "google", "facebook"],
            default: "local",
        },
        membership: {
            type: String,
            enum: ["standard", "bronze", "silver", "gold", "diamond"],
            default: "standard",
        },
        wishlist: [{ type: String, ref: "Tour" }],
        notifications: [notificationSchema],
        vouchers: [voucherSchema],
        vivupoints: { type: Number, default: 0 },
        passportStamps: [passportStampSchema],
        achievements: [achievementSchema],
    },
    { timestamps: true, _id: false },
);

module.exports = mongoose.model("User", userSchema);
