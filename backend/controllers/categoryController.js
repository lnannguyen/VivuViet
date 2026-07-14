const Category = require("../models/Category");
const Destination = require("../models/Destination");

// Lấy danh sách categories
const getCategories = async (req, res) => {
    try {
        const cats = await Category.find({ status: true });
        res.status(200).json(cats);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

// Lấy danh sách destinations (trang chủ)
const getDestinations = async (req, res) => {
    try {
        const dests = await Destination.find({ status: true });
        res.status(200).json(dests);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

module.exports = { getCategories, getDestinations };
