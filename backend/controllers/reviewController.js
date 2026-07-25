const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const mongoose = require("mongoose");

// Lấy reviews của 1 tour
const getTourReviews = async (req, res) => {
    try {
        const { tourId } = req.params;
        const reviews = await Review.find({ tour_id: tourId }).sort({
            createdAt: -1,
        });

        // Populate user info thủ công
        const User = require("../models/User");
        const userIds = [...new Set(reviews.map((r) => r.user_id))];
        const users = await User.find({ _id: { $in: userIds } }).select(
            "fullname avatar",
        );
        const userMap = {};
        users.forEach((u) => {
            userMap[u._id] = u;
        });

        const result = reviews.map((r) => ({
            ...r.toObject(),
            user: userMap[r.user_id] || { fullname: "Ẩn danh", avatar: "" },
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Tạo review sau khi hoàn thành tour
const createReview = async (req, res) => {
    try {
        const { booking_id, tour_id, rating, comment, images } = req.body;
        const user_id = req.user.id;

        if (!booking_id || !tour_id || !rating) {
            return res
                .status(400)
                .json({ message: "Thiếu thông tin đánh giá!" });
        }

        // Kiểm tra booking thuộc user và đã hoàn thành
        const booking = await Booking.findOne({ _id: booking_id, user_id });
        if (!booking)
            return res.status(403).json({ message: "Bạn chưa đặt tour này!" });
        if (booking.booking_status !== "completed") {
            return res
                .status(400)
                .json({ message: "Tour chưa hoàn thành, không thể đánh giá!" });
        }

        // Kiểm tra đã review chưa
        const existing = await Review.findOne({ booking_id, user_id });
        if (existing) {
            // Tự động chữa lành: Đảm bảo booking được đánh dấu là đã review
            await Booking.findByIdAndUpdate(booking_id, { isReviewed: true });
            return res
                .status(400)
                .json({ message: "Bạn đã đánh giá tour này rồi!" });
        }

        const newId = "REV" + Date.now().toString().slice(-8);

        // Xử lý file tải lên (Cloudinary Cloud + Fallback ổ đĩa)
        const cloudinary = require("../config/cloudinary");

        let imagePaths = [];
        let videoPaths = [];

        if (req.files && req.files.images) {
            for (const f of req.files.images) {
                let imgUrl = "/assets/images/reviews/" + f.filename;
                if (
                    process.env.CLOUDINARY_CLOUD_NAME &&
                    process.env.CLOUDINARY_API_KEY &&
                    process.env.CLOUDINARY_API_SECRET
                ) {
                    try {
                        const cloudResult = await cloudinary.uploader.upload(f.path, {
                            folder: "vivuviet_reviews/images",
                            resource_type: "image",
                        });
                        if (cloudResult && cloudResult.secure_url) {
                            imgUrl = cloudResult.secure_url;
                        }
                    } catch (err) {
                        console.warn("Cloudinary image upload fallback to local storage:", err.message);
                    }
                }
                imagePaths.push(imgUrl);
            }
        }

        if (req.files && req.files.videos) {
            for (const f of req.files.videos) {
                let vidUrl = "/assets/videos/reviews/" + f.filename;
                if (
                    process.env.CLOUDINARY_CLOUD_NAME &&
                    process.env.CLOUDINARY_API_KEY &&
                    process.env.CLOUDINARY_API_SECRET
                ) {
                    try {
                        const cloudResult = await cloudinary.uploader.upload(f.path, {
                            folder: "vivuviet_reviews/videos",
                            resource_type: "video",
                        });
                        if (cloudResult && cloudResult.secure_url) {
                            vidUrl = cloudResult.secure_url;
                        }
                    } catch (err) {
                        console.warn("Cloudinary video upload fallback to local storage:", err.message);
                    }
                }
                videoPaths.push(vidUrl);
            }
        }

        const review = await Review.create({
            _id: newId,
            booking_id,
            user_id,
            tour_id,
            rating: Number(rating),
            comment: comment || "",
            images: imagePaths,
            videos: videoPaths,
        });

        // Cập nhật rating trung bình và review count của tour
        const allReviews = await Review.find({ tour_id });
        const avgRating =
            allReviews.reduce((sum, r) => sum + r.rating, 0) /
            allReviews.length;
        await Tour.findByIdAndUpdate(tour_id, {
            $set: {
                rating: Math.round(avgRating * 10) / 10,
                rating_avg: Math.round(avgRating * 10) / 10,
            },
            $inc: { reviewCount: 1, review_count: 1 },
        });

        // Đánh dấu booking là đã review
        await Booking.findByIdAndUpdate(booking_id, { isReviewed: true });
        
        // Tính điểm thưởng
        const earnedPoints = 50 + (imagePaths.length * 20) + (videoPaths.length * 30);
        let pointMsg = `Bạn được cộng ${earnedPoints} VivuPoints từ việc đánh giá chuyến đi!`;
        if (imagePaths.length > 0 || videoPaths.length > 0) {
            pointMsg += ` (Bao gồm điểm thưởng thêm cho ${imagePaths.length} ảnh và ${videoPaths.length} video)`;
        }

        // Cộng điểm cho user
        await require("../models/User").findByIdAndUpdate(user_id, {
            $inc: { vivupoints: earnedPoints },
            $push: {
                notifications: {
                    title: "Nhận điểm thưởng",
                    content: pointMsg,
                    type: "system",
                    isRead: false,
                },
            },
        });

        res.status(201).json({ message: "Đánh giá thành công!", review, earnedPoints });
    } catch (error) {
        console.error("createReview error:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy các review mới nhất cho trang chủ
const getRecentReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }).limit(10);

        const User = require("../models/User");
        const userIds = [...new Set(reviews.map((r) => r.user_id))];
        const users = await User.find({ _id: { $in: userIds } }).select(
            "fullname avatar location",
        );
        const userMap = {};
        users.forEach((u) => {
            userMap[u._id] = u;
        });

        const result = reviews.map((r) => {
            const u = userMap[r.user_id] || {
                fullname: "Ẩn danh",
                avatar: "",
                location: "Khách hàng VivuViet",
            };
            return {
                ...r.toObject(),
                user: u,
            };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy review theo booking id
const getReviewByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const review = await Review.findOne({
            booking_id: bookingId,
            user_id: req.user.id,
        });
        if (!review)
            return res.status(404).json({ message: "Không tìm thấy đánh giá" });
        res.json(review);
    } catch (error) {
        console.error("Lỗi lấy review:", error);
        res.status(500).json({ message: "Lỗi kết nối máy chủ!" });
    }
};

// Lấy tất cả review của user hiện tại
const getUserReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviews = await Review.find({ user_id: userId }).sort({ createdAt: -1 });

        if (!reviews || reviews.length === 0) {
            return res.json([]);
        }

        // Populate tour info thủ công
        const tourIds = [...new Set(reviews.map((r) => r.tour_id))];
        const tours = await Tour.find({ _id: { $in: tourIds } }).select("name image images price duration");
        
        const tourMap = {};
        tours.forEach((t) => {
            tourMap[t._id] = t;
        });

        const formattedReviews = reviews.map((r) => {
            const tourInfo = tourMap[r.tour_id];
            return {
                ...r.toObject(),
                tour: tourInfo ? {
                    name: tourInfo.name,
                    image: tourInfo.image || (tourInfo.images && tourInfo.images.length > 0 ? tourInfo.images[0] : null),
                    price: tourInfo.price,
                    duration: tourInfo.duration
                } : null,
            };
        });

        res.json(formattedReviews);
    } catch (error) {
        console.error("getUserReviews error:", error);
        res.status(500).json({ message: "Lỗi kết nối máy chủ!" });
    }
};

module.exports = {
    getTourReviews,
    createReview,
    getRecentReviews,
    getReviewByBooking,
    getUserReviews,
};
