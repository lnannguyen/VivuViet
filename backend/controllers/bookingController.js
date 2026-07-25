const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const User = require("../models/User");
const { sendSplitBillInvoice } = require("../services/emailService");

// Tạo booking mới - Step 3 của checkout stepper
const createBooking = async (req, res) => {
    try {
        const {
            tour_id,
            departure_date,
            quantity,
            passengers,
            voucher_code,
            payment_method,
            bill_split,
        } = req.body;
        const user_id = req.user.id;

        if (!tour_id || !departure_date || !quantity) {
            return res
                .status(400)
                .json({ message: "Thiếu thông tin đặt tour!" });
        }

        const tour = await Tour.findById(tour_id);
        if (!tour)
            return res.status(404).json({ message: "Tour không tồn tại!" });
        if (tour.availableSeats < quantity) {
            return res
                .status(400)
                .json({ message: `Chỉ còn ${tour.availableSeats} chỗ trống!` });
        }

        const adultsQty = req.body.adults_qty || quantity;
        const childrenQty = req.body.children_qty || 0;
        const adultPrice = tour.price;
        const childPrice = tour.childPrice || Math.round(adultPrice * 0.5);
        const total_price = adultsQty * adultPrice + childrenQty * childPrice;

        const service_fee = Math.round(
            (total_price * (tour.service_fee_rate || 10)) / 100,
        );
        let discount_amount = 0;

        // Lấy thông tin user
        let user = await User.findById(user_id);

        // Xử lý voucher nếu có (Kiểm tra cá nhân trước, toàn hệ thống sau)
        if (voucher_code) {
            let voucher = user ? user.vouchers.find(
                (v) =>
                    v.code === voucher_code &&
                    !v.isUsed &&
                    new Date(v.expiry_date) > new Date() &&
                    total_price >= (v.min_spend || 0),
            ) : null;

            if (voucher) {
                discount_amount =
                    voucher.discount_type === "percentage"
                        ? Math.round(
                              (total_price * voucher.discount_amount) / 100,
                          )
                        : voucher.discount_amount;
                voucher.isUsed = true;
                await user.save();
            } else {
                const VoucherModel = require("../models/Voucher");
                const globalVoucher = await VoucherModel.findOne({ code: voucher_code });
                if (
                    globalVoucher &&
                    new Date() <= new Date(globalVoucher.valid_until) &&
                    globalVoucher.used_count < globalVoucher.max_uses
                ) {
                    discount_amount = globalVoucher.discount_amount;
                    globalVoucher.used_count += 1;
                    await globalVoucher.save();
                }
            }
        }

        const final_price = Math.max(0, total_price + service_fee - discount_amount);

        // Sinh ID booking
        const newId = "BK" + Date.now().toString().slice(-8);

        const booking = await Booking.create({
            _id: newId,
            user_id,
            tour_id,
            departure_date: new Date(departure_date),
            quantity,
            passengers: passengers || [],
            total_price,
            service_fee,
            voucher_code: voucher_code || null,
            discount_amount,
            final_price,
            bill_split: bill_split || [],
            booking_status: "pending",
            payment_method: payment_method || "bank_transfer",
        });

        // Cập nhật số ghế còn lại & booking count
        await Tour.findByIdAndUpdate(tour_id, {
            $inc: { availableSeats: -quantity, bookingCount: 1 },
        });

        // Tặng VivuPoints (1 điểm = 10,000đ)
        const pointsEarned = Math.floor(final_price / 10000);
        await User.findByIdAndUpdate(user_id, {
            $inc: { vivupoints: pointsEarned },
            $push: {
                notifications: {
                    title: "Đặt tour thành công!",
                    content: `Bạn vừa đặt tour "${tour.title}" thành công. Bạn được cộng ${pointsEarned} VivuPoints!`,
                    type: "booking",
                    isRead: false,
                },
            },
        });

        let previewUrl = null;
        // Gửi email chia bill nếu có yêu cầu chia bill
        if (bill_split && bill_split.length > 0) {
            previewUrl = await sendSplitBillInvoice(booking, user, tour);
        }

        res.status(201).json({
            message: "Đặt tour thành công!",
            booking,
            points_earned: pointsEarned,
            email_preview: previewUrl,
        });
    } catch (error) {
        console.error("createBooking error:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy danh sách booking của user
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user_id: req.user.id }).sort({
            createdAt: -1,
        }).lean();

        // Populate thông tin tour thủ công (do dùng string ID)
        const tourIds = [...new Set(bookings.map((b) => b.tour_id))];
        const tours = await Tour.find({ _id: { $in: tourIds } });
        const tourMap = {};
        tours.forEach((t) => {
            tourMap[t._id] = t;
        });

        // Self-healing cho dữ liệu cũ: Kiểm tra các review đã có
        const Review = require("../models/Review");
        const userReviews = await Review.find({ user_id: req.user.id });
        const reviewedBookingIds = userReviews.map(r => r.booking_id);

        const result = bookings.map((b) => {
            console.log("Checking booking:", b._id, "in reviewedBookingIds:", reviewedBookingIds.includes(b._id));
            // Tự động sửa nếu đã review mà isReviewed vẫn false
            if (reviewedBookingIds.includes(b._id) && !b.isReviewed) {
                console.log("Setting isReviewed to true for", b._id);
                b.isReviewed = true;
                Booking.findByIdAndUpdate(b._id, { isReviewed: true }).exec();
            }
            return {
                ...b,
                tour: tourMap[b.tour_id] || null,
            };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Cập nhật trạng thái booking (thanh toán, huỷ...)
const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId, user_id: req.user.id },
            { booking_status: status },
            { new: true },
        );

        if (!booking)
            return res.status(404).json({ message: "Không tìm thấy booking!" });
        res.status(200).json({ message: "Cập nhật thành công!", booking });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Cập nhật chia hoá đơn nhóm - Bill Splitting feature
const updateBillSplit = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { bill_split } = req.body;

        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId, user_id: req.user.id },
            { $set: { bill_split } },
            { new: true },
        );

        if (!booking)
            return res.status(404).json({ message: "Không tìm thấy booking!" });
        res.status(200).json({
            message: "Cập nhật chia hoá đơn thành công!",
            booking,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Hủy booking
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findOne({
            _id: bookingId,
            user_id: req.user.id,
        });
        if (!booking)
            return res.status(404).json({ message: "Không tìm thấy booking!" });

        if (booking.booking_status === "cancelled") {
            return res
                .status(400)
                .json({ message: "Booking đã bị hủy trước đó!" });
        }
        if (booking.booking_status === "completed") {
            return res
                .status(400)
                .json({ message: "Không thể hủy booking đã hoàn thành!" });
        }

        booking.booking_status = "cancelled";
        await booking.save();

        // Hoàn lại số ghế cho tour
        await Tour.findByIdAndUpdate(booking.tour_id, {
            $inc: { availableSeats: booking.quantity, bookingCount: -1 },
        });

        // Gửi thông báo hủy cho user
        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                notifications: {
                    title: "Hủy tour thành công",
                    content: `Yêu cầu hủy tour của bạn đã được tiếp nhận. Chúng tôi sẽ hoàn tiền trong 3-5 ngày làm việc.`,
                    type: "booking",
                    isRead: false,
                },
            },
        });

        res.status(200).json({ message: "Hủy tour thành công!", booking });
    } catch (error) {
        console.error("cancelBooking error:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Hoàn thành tour, cấp Passport và Achievements
const completeBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate("tour_id");

        if (!booking) {
            return res.status(404).json({ message: "Không tìm thấy Booking!" });
        }

        if (booking.booking_status === "completed") {
            return res
                .status(400)
                .json({ message: "Tour này đã được hoàn thành trước đó!" });
        }

        booking.booking_status = "completed";
        await booking.save();

        const user = await User.findById(booking.user_id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy User!" });
        }

        // Cập nhật Passport Stamp
        const tourObj = (typeof booking.tour_id === "object" && booking.tour_id)
            ? booking.tour_id
            : await Tour.findById(booking.tour_id);

        const locationName = (tourObj && tourObj.destination) ? tourObj.destination : "Việt Nam";
        const tourImage = (tourObj && tourObj.image) ? tourObj.image : "/assets/images/dulichbien.png";

        const existingStamp = user.passportStamps.find(
            (s) => s.location === locationName,
        );

        if (existingStamp) {
            existingStamp.visitCount += 1;
            existingStamp.lastVisitDate = new Date();
        } else {
            user.passportStamps.push({
                location: locationName,
                image: tourImage,
                visitCount: 1,
                firstVisitDate: new Date(),
                lastVisitDate: new Date(),
            });
        }

        // Logic kiểm tra và cấp Achievements
        const completedBookings = await Booking.countDocuments({
            user_id: user._id,
            booking_status: "completed",
        });
        let newAchievement = null;

        if (
            completedBookings === 1 &&
            !user.achievements.find((a) => a.label === "Khởi đầu mới")
        ) {
            newAchievement = {
                label: "Khởi đầu mới",
                icon: "bi-rocket-takeoff-fill",
                color: "#3b82f6",
            };
            user.achievements.push(newAchievement);
        } else if (
            completedBookings === 5 &&
            !user.achievements.find((a) => a.label === "Nhà thám hiểm")
        ) {
            newAchievement = {
                label: "Nhà thám hiểm",
                icon: "bi-compass-fill",
                color: "#10b981",
            };
            user.achievements.push(newAchievement);
        }

        if (newAchievement) {
            user.notifications.push({
                title: "Mở khóa thành tựu mới!",
                content: `Chúc mừng! Bạn đã mở khóa thành tựu "${newAchievement.label}".`,
                type: "achievement",
            });
        }

        await user.save();

        res.status(200).json({
            message: "Hoàn thành chuyến đi thành công!",
            booking,
            newAchievement,
        });
    } catch (error) {
        console.error("Complete booking error:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    updateBookingStatus,
    updateBillSplit,
    cancelBooking,
    completeBooking,
};
