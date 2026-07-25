const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Đăng ký
const register = async (req, res) => {
    try {
        const { fullname, email, phone, password } = req.body;

        if (!fullname || !email || !password) {
            return res
                .status(400)
                .json({ message: "Vui lòng điền đầy đủ thông tin!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo ID dạng USR + ObjectId ngắn
        const newId =
            "USR" +
            new mongoose.Types.ObjectId().toString().slice(-6).toUpperCase();

        const user = await User.create({
            _id: newId,
            fullname,
            email,
            phone: phone || "",
            password: hashedPassword,
            auth_provider: "local",
            membership: "standard",
            wishlist: [],
            notifications: [
                {
                    title: "Chào mừng gia nhập VivuViet!",
                    content: `Xin chào ${fullname}, chào mừng bạn đã tham gia cộng đồng du lịch VivuViet!`,
                    type: "general",
                    isRead: false,
                },
            ],
            vouchers: [
                {
                    code: "WELCOME200K",
                    discount_amount: 200000,
                    discount_type: "fixed",
                    min_spend: 1000000,
                    expiry_date: new Date(
                        Date.now() + 90 * 24 * 60 * 60 * 1000,
                    ), // 90 ngày
                    isUsed: false,
                },
            ],
            vivupoints: 0,
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        const { password: _, ...userData } = user.toObject();
        res.status(201).json({
            message: "Đăng ký thành công!",
            token,
            user: userData,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Vui lòng nhập email và mật khẩu!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email không tồn tại!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không đúng!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        const { password: _, ...userData } = user.toObject();
        res.status(200).json({
            message: "Đăng nhập thành công!",
            token,
            user: userData,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy thông tin cá nhân (cần auth)
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user)
            return res
                .status(404)
                .json({ message: "Không tìm thấy người dùng!" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Cập nhật profile
const updateProfile = async (req, res) => {
    try {
        const { fullname, phone, avatar, vivupoints, vouchers, notifications } =
            req.body;
        const update = {};
        if (fullname !== undefined) update.fullname = fullname;
        if (phone !== undefined) update.phone = phone;
        if (avatar !== undefined) update.avatar = avatar;
        if (vivupoints !== undefined) update.vivupoints = vivupoints;
        if (vouchers !== undefined) update.vouchers = vouchers;
        if (notifications !== undefined) update.notifications = notifications;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { new: true },
        ).select("-password");

        res.status(200).json({ message: "Cập nhật thành công!", user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Thêm/xóa tour khỏi wishlist
const toggleWishlist = async (req, res) => {
    try {
        const { tourId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user)
            return res
                .status(404)
                .json({ message: "Người dùng không tồn tại!" });

        const idx = user.wishlist.indexOf(tourId);
        if (idx === -1) {
            user.wishlist.push(tourId);
        } else {
            user.wishlist.splice(idx, 1);
        }
        await user.save();

        res.status(200).json({
            message:
                idx === -1
                    ? "Đã thêm vào yêu thích!"
                    : "Đã xoá khỏi yêu thích!",
            wishlist: user.wishlist,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Đánh dấu thông báo đã đọc
const markNotificationRead = async (req, res) => {
    try {
        const { notifId } = req.params;
        const user = await User.findById(req.user.id);
        const notif = user.notifications.id(notifId);
        if (!notif)
            return res
                .status(404)
                .json({ message: "Không tìm thấy thông báo!" });
        notif.isRead = true;
        await user.save();
        res.status(200).json({
            message: "Đã đọc thông báo!",
            notifications: user.notifications,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Validate voucher
const validateVoucher = async (req, res) => {
    try {
        const { code, tourPrice } = req.body;
        const user = await User.findById(req.user.id);

        const voucher = user.vouchers.find(
            (v) =>
                v.code === code &&
                !v.isUsed &&
                new Date(v.expiry_date) > new Date(),
        );
        if (!voucher) {
            return res
                .status(400)
                .json({ message: "Voucher không hợp lệ hoặc đã hết hạn!" });
        }
        if (tourPrice < voucher.min_spend) {
            return res.status(400).json({
                message: `Voucher yêu cầu đơn hàng tối thiểu ${voucher.min_spend.toLocaleString("vi-VN")}đ!`,
            });
        }

        const discount =
            voucher.discount_type === "percentage"
                ? Math.round((tourPrice * voucher.discount_amount) / 100)
                : voucher.discount_amount;

        res.status(200).json({
            message: "Voucher hợp lệ!",
            discount_amount: discount,
            voucher,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
// Quên mật khẩu - Gửi mã OTP khôi phục
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập địa chỉ email!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email này chưa được đăng ký tài khoản!" });
        }

        // Sinh mã OTP 6 chữ số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
        await user.save();

        const { sendPasswordResetOtp } = require("../services/emailService");
        const emailPreview = await sendPasswordResetOtp(user, otp);

        res.status(200).json({
            message: "Mã OTP khôi phục đã được gửi về email của bạn!",
            otp: otp, // Gửi về để hỗ trợ test nhanh trên UI nếu cần
            email_preview: emailPreview,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
    }
};

// Đặt lại mật khẩu mới bằng OTP
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ Email, Mã OTP và Mật khẩu mới!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.status(400).json({ message: "Mã OTP không chính xác!" });
        }

        if (!user.resetOtpExpire || new Date(user.resetOtpExpire) < new Date()) {
            return res.status(400).json({ message: "Mã OTP đã hết hạn, vui lòng yêu cầu mã mới!" });
        }

        // Mã hóa mật khẩu mới
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save();

        res.status(200).json({
            message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    toggleWishlist,
    markNotificationRead,
    validateVoucher,
    forgotPassword,
    resetPassword,
};
