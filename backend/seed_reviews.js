require("dotenv").config();
const mongoose = require("mongoose");
const Review = require("./models/Review");
const User = require("./models/User");
const Tour = require("./models/Tour");
const Booking = require("./models/Booking");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("Connection error:", error.message);
        process.exit(1);
    }
};

const seedReviews = async () => {
    await connectDB();

    try {
        // Tìm một vài user
        const users = await User.find().limit(3);
        if (users.length === 0) {
            console.log("Không tìm thấy user nào, vui lòng seed user trước.");
            process.exit(0);
        }

        // Tìm một vài tour
        const tours = await Tour.find().limit(3);
        if (tours.length === 0) {
            console.log("Không tìm thấy tour nào, vui lòng seed tour trước.");
            process.exit(0);
        }

        // Xóa reviews cũ
        await Review.deleteMany({});

        // Tạo mảng reviews mẫu
        const reviews = [
            {
                _id: "REV" + Math.random().toString().slice(2, 10),
                booking_id: "BKG_MOCK_1", // Booking ảo
                user_id: users[0]._id,
                tour_id: tours[0]._id,
                rating: 5,
                comment:
                    "Chuyến đi tuyệt vời! Hướng dẫn viên rất nhiệt tình, phong cảnh Hạ Long đẹp hơn mong đợi. Chắc chắn sẽ quay lại cùng gia đình.",
                images: [],
                createdAt: new Date(Date.now() - 86400000 * 2), // 2 ngày trước
            },
            {
                _id: "REV" + Math.random().toString().slice(2, 10),
                booking_id: "BKG_MOCK_2",
                user_id: users[1] ? users[1]._id : users[0]._id,
                tour_id: tours[1] ? tours[1]._id : tours[0]._id,
                rating: 4,
                comment:
                    "Dịch vụ tốt, khách sạn sạch sẽ. Tuy nhiên lịch trình hơi dày đặc nên đi chơi thấy hơi mệt một chút. Dù sao cũng đáng tiền!",
                images: [],
                createdAt: new Date(Date.now() - 86400000 * 5), // 5 ngày trước
            },
            {
                _id: "REV" + Math.random().toString().slice(2, 10),
                booking_id: "BKG_MOCK_3",
                user_id: users[2] ? users[2]._id : users[0]._id,
                tour_id: tours[2] ? tours[2]._id : tours[0]._id,
                rating: 5,
                comment:
                    "VivuViet tổ chức tour quá chuyên nghiệp. Từ xe đón, ăn uống đến các hoạt động team building đều rất vui và chu đáo. 10 điểm không có nhưng!",
                images: [],
                createdAt: new Date(Date.now() - 86400000 * 10), // 10 ngày trước
            },
            {
                _id: "REV" + Math.random().toString().slice(2, 10),
                booking_id: "BKG_MOCK_4",
                user_id: users[0]._id,
                tour_id: tours[1] ? tours[1]._id : tours[0]._id,
                rating: 5,
                comment:
                    "Rất ấn tượng với văn hóa ẩm thực địa phương. Hướng dẫn viên am hiểu lịch sử và kể chuyện rất duyên. Một kỷ niệm khó quên.",
                images: [],
                createdAt: new Date(Date.now() - 86400000 * 15), // 15 ngày trước
            },
        ];

        await Review.insertMany(reviews);
        console.log("Seed reviews thành công!");

        // Cập nhật lại rating_avg cho các tour
        for (let tour of tours) {
            const tourReviews = await Review.find({ tour_id: tour._id });
            if (tourReviews.length > 0) {
                const avg =
                    tourReviews.reduce((sum, r) => sum + r.rating, 0) /
                    tourReviews.length;
                await Tour.findByIdAndUpdate(tour._id, {
                    rating: Math.round(avg * 10) / 10,
                    rating_avg: Math.round(avg * 10) / 10,
                    reviewCount: tourReviews.length,
                    review_count: tourReviews.length,
                });
            }
        }
        console.log("Cập nhật rating tour thành công!");
    } catch (error) {
        console.error("Lỗi khi seed review:", error);
    } finally {
        process.exit(0);
    }
};

seedReviews();
