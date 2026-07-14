const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema(
    {
        day: { type: Number, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
    },
    { _id: false },
);

const locationCoordsSchema = new mongoose.Schema(
    {
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number },
    },
    { _id: false },
);

const tourSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // Sử dụng mã tour làm _id (tour001...)
        // Mã định danh độc nhất
        code: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },

        // Tên chương trình tour (hỗ trợ cả title và name)
        title: { type: String, required: true },
        name: { type: String, required: true },

        // Địa điểm
        location: { type: String, required: true }, // e.g. "Cao Bằng, Việt Nam"
        destination: { type: String }, // e.g. "Cao Bằng"
        departure: { type: String, default: "Hà Nội" },

        // Thời gian
        duration: { type: String, required: true }, // e.g. "3 Ngày 2 Đêm" hoặc "3N2Đ"
        days: { type: Number, default: 1 }, // Số ngày phục vụ tính toán filter

        // Giá cả và khuyến mãi
        price: { type: Number, required: true },
        oldPrice: { type: Number },
        childPrice: { type: Number },
        discount: { type: Number, default: 0 },
        service_fee_rate: { type: Number, default: 10 }, // % phí dịch vụ và thuế, mặc định 10%

        // Khách mời
        maxGuests: { type: Number, default: 30 },
        availableSeats: { type: Number, default: 30 },

        // Đánh giá và tương tác
        rating: { type: Number, default: 0 },
        rating_avg: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        review_count: { type: Number, default: 0 },
        viewCount: { type: Number, default: 0 },
        bookingCount: { type: Number, default: 0 },

        // Hình ảnh
        image: { type: String },
        thumbnail: { type: String },
        images: [{ type: String }],
        gallery: [{ type: String }],

        // Phân loại tour
        category: { type: String }, // e.g. "Du lịch biển", "Vùng Cao", "Văn Hóa & Di Sản"

        // Nội dung chi tiết
        description: { type: String },
        itinerary: [itinerarySchema],
        highlights: [{ type: String }],
        included: [{ type: String }],
        includes: [{ type: String }],
        excluded: [{ type: String }],
        excludes: [{ type: String }],

        // Tâm trạng và từ khóa gợi ý
        mood: [{ type: String }], // e.g. ["thư giãn", "phiêu lưu", "thiên nhiên", "gia đình"]
        matchingTags: [{ type: String }], // tag để tính Quiz Matching

        // Thời tiết & bản đồ
        weatherLocation: { type: String }, // dùng làm tham số gọi API thời tiết
        locationCoords: locationCoordsSchema,
        meetingPoint: { type: String },
        virtual360: { type: String }, // link Street View

        // Lịch khởi hành
        departureDates: [{ type: String }], // danh sách ngày khởi hành

        isFeatured: { type: Boolean, default: false },
        status: { type: String, default: "Available" },
    },
    { timestamps: true, _id: false },
);

module.exports = mongoose.model("Tour", tourSchema);
