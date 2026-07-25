const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5000",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://127.0.0.1:5000",
        ],
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const tourRoutes = require("./routes/tourRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const voucherRoutes = require("./routes/voucherRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", categoryRoutes); // /api/categories, /api/destinations
app.use("/api/users", userRoutes);
app.use("/api/vouchers", voucherRoutes);

// Serve static assets of frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Page Routing matching Sitemap (Bảng 3.7)
app.get("/", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/index.html")),
);
app.get("/tours", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/tours/tours.html")),
);
app.get("/tours/:slugOrId", (req, res) =>
    res.sendFile(
        path.join(__dirname, "../frontend/tour-detail/tour-detail.html"),
    ),
);
app.get("/login", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/login/login.html")),
);
app.get("/register", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/register/register.html")),
);
app.get("/coming-soon", (req, res) =>
    res.sendFile(
        path.join(__dirname, "../frontend/coming-soon/coming-soon.html"),
    ),
);
app.get("/booking/success", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/booking/success.html")),
);
app.get("/booking/failed", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/booking/failed.html")),
);
app.get("/booking/:tourId", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/booking/booking.html")),
);
app.get("/booking/:tourId/payment", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/booking/payment.html")),
);
app.get("/profile", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/info", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/bookings", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/reviews", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/bookings/:id/review", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/wishlist", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/notifications", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/points", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/vouchers", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/passport", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);
app.get("/profile/achievements", (req, res) =>
    res.sendFile(path.join(__dirname, "../frontend/profile/profile.html")),
);

// Health check endpoint for API info
app.get("/api/health", (req, res) => {
    res.json({
        message: "VivuViet API đang chạy!",
        version: "1.0.0",
    });
});

// Helper nạp tự động tài khoản thử nghiệm anan265464@gmail.com khi server khởi động
async function autoSeedDefaultUser() {
    try {
        const User = require("./models/User");
        const bcrypt = require("bcryptjs");
        const testUser = await User.findOne({ email: "anan265464@gmail.com" });
        if (!testUser) {
            const salt = await bcrypt.genSalt(10);
            const defaultPassword = await bcrypt.hash("123456", salt);
            await User.updateOne(
                { _id: "USR001" },
                {
                    $set: {
                        _id: "USR001",
                        fullname: "Nguyễn Minh Anh",
                        email: "anan265464@gmail.com",
                        phone: "0901234567",
                        password: defaultPassword,
                        auth_provider: "local",
                        membership: "gold",
                        vivupoints: 350,
                    },
                },
                { upsert: true }
            );
            console.log("Auto-seeded test account: anan265464@gmail.com");
        }
    } catch (err) {
        console.error("AutoSeed check error:", err.message);
    }
}

// Kết nối MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Kết nối MongoDB thành công!");
        await autoSeedDefaultUser();
    })
    .catch((err) => console.log("Lỗi kết nối MongoDB:", err));

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
