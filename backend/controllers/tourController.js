const Tour = require("../models/Tour");
const Review = require("../models/Review");

// Lấy danh sách tour với filter đầy đủ
const getAllTours = async (req, res) => {
    try {
        const {
            keyword,
            location,
            destination,
            category,
            minPrice,
            maxPrice,
            duration,
            days,
            mood,
            isFeatured,
            status,
            sortBy,
            order,
            limit,
            page,
        } = req.query;

        let filter = {};

        if (keyword) {
            filter.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { destination: { $regex: keyword, $options: "i" } },
                { location: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } }
            ];
        }

        if (location) filter.location = { $regex: location, $options: "i" };
        if (destination)
            filter.destination = { $regex: destination, $options: "i" };
        if (category) filter.category = { $regex: category, $options: "i" };
        if (isFeatured) filter.isFeatured = isFeatured === "true";
        if (status) filter.status = status;
        if (mood) filter.mood = { $in: [mood] };
        if (duration) filter.duration = { $regex: duration, $options: "i" };
        if (days) filter.days = Number(days);

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Sắp xếp
        let sort = {};
        const sortField = sortBy || "createdAt";
        const sortOrder = order === "asc" ? 1 : -1;
        sort[sortField] = sortOrder;

        // Phân trang
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 100;
        const skip = (pageNum - 1) * limitNum;

        console.log("DEBUG_FILTER:", JSON.stringify(filter));

        const [tours, total] = await Promise.all([
            Tour.find(filter).sort(sort).skip(skip).limit(limitNum),
            Tour.countDocuments(filter),
        ]);

        res.status(200).json({
            tours,
            debug_filter: filter,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("getAllTours error:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy chi tiết 1 tour bằng slug hoặc id
const getTourBySlug = async (req, res) => {
    try {
        // Thử tìm bằng slug trước, sau đó bằng _id
        const { slugOrId } = req.params;
        let tour = await Tour.findOne({ slug: slugOrId });
        if (!tour) tour = await Tour.findById(slugOrId);
        if (!tour)
            return res.status(404).json({ message: "Không tìm thấy tour!" });

        // Cập nhật số lượt xem
        await Tour.findByIdAndUpdate(tour._id, { $inc: { viewCount: 1 } });

        // Lấy reviews của tour
        const reviews = await Review.find({ tour_id: tour._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({ ...tour.toObject(), reviews });
    } catch (error) {
        console.error("getTourBySlug error:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy chi tiết 1 tour bằng id (legacy)
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour)
            return res.status(404).json({ message: "Không tìm thấy tour!" });

        const reviews = await Review.find({ tour_id: tour._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({ ...tour.toObject(), reviews });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy các tour nổi bật / gợi ý trang chủ
const getFeaturedTours = async (req, res) => {
    try {
        const tours = await Tour.find({ isFeatured: true, status: "Available" })
            .sort({ rating: -1 })
            .limit(8);
        res.status(200).json(tours);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Gợi ý tour theo tâm trạng (Tour Mood feature)
const getToursByMood = async (req, res) => {
    try {
        const { moods } = req.query; // Comma-separated: "thư giãn,thiên nhiên"
        const moodArray = moods ? moods.split(",").map((m) => m.trim()) : [];

        const tours = await Tour.find({
            mood: { $in: moodArray },
            status: "Available",
        })
            .sort({ rating: -1 })
            .limit(10);

        res.status(200).json(tours);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Thêm tour mới
const createTour = async (req, res) => {
    try {
        const tour = await Tour.create(req.body);
        res.status(201).json({ message: "Thêm tour thành công!", tour });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

module.exports = {
    getAllTours,
    getTourById,
    getTourBySlug,
    getFeaturedTours,
    getToursByMood,
    createTour,
};
