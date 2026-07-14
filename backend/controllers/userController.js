const User = require("../models/User");
const bcrypt = require("bcryptjs");

// [PUT] /api/users/profile - Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // from authMiddleware
        const { fullname, phone, avatar, dob, gender, address, oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: "Người dùng không tồn tại" });
        }

        // Update basic info
        if (fullname) user.fullname = fullname;
        if (phone !== undefined) user.phone = phone;
        if (dob !== undefined) user.dob = dob;
        if (gender !== undefined) user.gender = gender;
        if (address !== undefined) user.address = address;
        if (avatar) user.avatar = avatar;

        // Handle password change if provided
        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({ message: "Mật khẩu cũ không chính xác" });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        const { password: _, ...userData } = user.toObject();
        res.status(200).json({
            message: "Cập nhật thông tin thành công",
            user: userData,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// [POST] /api/users/profile/avatar - Upload user avatar
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res
                .status(400)
                .json({ message: "Không có file nào được tải lên!" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: "Người dùng không tồn tại" });
        }

        // Đường dẫn tương đối để frontend render
        const avatarUrl = "/assets/images/avt/" + req.file.filename;

        user.avatar = avatarUrl;
        await user.save();

        const { password: _, ...userData } = user.toObject();
        res.status(200).json({
            message: "Cập nhật ảnh đại diện thành công",
            user: userData,
        });
    } catch (error) {
        console.error("Upload avatar error:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// [POST] /api/users/redeem-points - Redeem VivuPoints for a voucher
const redeemPoints = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pointsToRedeem } = req.body;

        if (!pointsToRedeem || pointsToRedeem < 100) {
            return res
                .status(400)
                .json({ message: "Số điểm tối thiểu để đổi là 100 điểm." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: "Người dùng không tồn tại" });
        }

        if (user.vivupoints < pointsToRedeem) {
            return res
                .status(400)
                .json({ message: "Số dư VivuPoints không đủ!" });
        }

        // Deduct points
        user.vivupoints -= pointsToRedeem;

        // Create a unique voucher code
        const uniqueSuffix = Date.now().toString().slice(-4);
        const voucherCode = `REWARD${pointsToRedeem}${uniqueSuffix}`;
        const discountAmount = pointsToRedeem * 1000; // 1 point = 1,000 VND

        // Expiry in 30 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const newVoucher = {
            code: voucherCode,
            discount_amount: discountAmount,
            discount_type: "fixed",
            expiry_date: expiryDate,
            isUsed: false,
        };

        user.vouchers.push(newVoucher);

        // Add notification
        user.notifications.push({
            title: "Đổi điểm thành công!",
            content: `Bạn đã dùng ${pointsToRedeem} điểm để đổi lấy voucher giảm ${discountAmount.toLocaleString("vi-VN")} đ (Mã: ${voucherCode}).`,
            type: "point",
        });

        await user.save();

        res.status(200).json({
            message: "Đổi điểm thành công!",
            voucher: newVoucher,
            vivupoints: user.vivupoints,
        });
    } catch (error) {
        console.error("Redeem points error:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

module.exports = {
    updateProfile,
    uploadAvatar,
    redeemPoints,
};
