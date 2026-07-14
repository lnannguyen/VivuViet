const express = require("express");
const router = express.Router();
const {
    getAllTours,
    getTourById,
    getTourBySlug,
    getFeaturedTours,
    getToursByMood,
    createTour,
} = require("../controllers/tourController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllTours);
router.get("/featured", getFeaturedTours);
router.get("/mood", getToursByMood);
router.get("/:slugOrId", getTourBySlug);

// Admin routes (cần token)
router.post("/", protect, createTour);

module.exports = router;
