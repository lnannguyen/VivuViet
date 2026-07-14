require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Tour = require("./models/Tour");
const Booking = require("./models/Booking");
const Review = require("./models/Review");
const Category = require("./models/Category");
const Destination = require("./models/Destination");

// Paths to database files
const PROJECT3_DB_DIR = path.join(__dirname, "../project3/database");
const DOAN_DB_DIR = path.join(__dirname, "../doan/data");

const readJSON = (dir, file) => {
    return JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
};

const seedData = async () => {
    try {
        console.log("Đang kết nối tới MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Kết nối MongoDB thành công!");

        // Xoá dữ liệu cũ và drop index cũ để tránh lỗi duplicate key
        console.log("Đang xoá dữ liệu cũ...");
        await Promise.all([
            User.deleteMany({}),
            Tour.deleteMany({}),
            Booking.deleteMany({}),
            Review.deleteMany({}),
            Category.deleteMany({}),
            Destination.deleteMany({}),
        ]);
        // Drop index cũ nếu có (index `code_1` từ schema version cũ)
        try {
            await mongoose.connection
                .collection("categories")
                .dropIndex("code_1");
            console.log("Đã drop index code_1 trong categories");
        } catch (e) {
            /* Index chưa tồn tại thì bỏ qua */
        }
        try {
            await mongoose.connection.collection("tours").dropIndex("code_1");
            await mongoose.connection.collection("tours").dropIndex("slug_1");
        } catch (e) {
            /* Bỏ qua nếu chưa có */
        }
        console.log("Xoá dữ liệu cũ thành công!");

        // Đọc file JSON
        console.log("Đang đọc dữ liệu JSON...");
        const rawCustomers = readJSON(PROJECT3_DB_DIR, "customers.json");
        const rawTours = readJSON(PROJECT3_DB_DIR, "tours.json");
        const rawCategories = readJSON(DOAN_DB_DIR, "categories.json");
        const rawDestinations = readJSON(DOAN_DB_DIR, "destinations.json");
        const rawReviews = readJSON(PROJECT3_DB_DIR, "reviews.json");
        const rawBookings = readJSON(PROJECT3_DB_DIR, "bookings.json");

        // Xử lý & Seed Users (Customer)
        console.log("Dang ma hoa mat khau va xu ly du lieu Users...");
        const salt = await bcrypt.genSalt(10);
        const users = [];
        for (const cus of rawCustomers) {
            const hashedPassword = await bcrypt.hash(
                cus.password || "123456",
                salt,
            );
            users.push({
                _id: cus._id,
                fullname: cus.fullName,
                email: cus.email,
                phone: cus.phone,
                avatar: cus.avatar || "",
                password: hashedPassword,
                auth_provider: "local",
                membership: cus.membership
                    ? cus.membership.toLowerCase()
                    : "standard",
                wishlist: [],
                notifications: [
                    {
                        title: "Chào mừng gia nhập VivuViet!",
                        content: `Xin chào ${cus.fullName}, chào mừng bạn đã tham gia cộng đồng du lịch VivuViet. Chúc bạn có những hành trình trọn vẹn!`,
                        type: "general",
                        isRead: false,
                    },
                ],
                vouchers: [
                    {
                        code: "VIVUVIET2026",
                        discount_amount: 200000,
                        discount_type: "fixed",
                        min_spend: 1000000,
                        expiry_date: new Date("2026-12-31"),
                        isUsed: false,
                    },
                ],
                vivupoints: cus.viPoints || 0,
                passportStamps: [
                    {
                        location: "Hội An, Quảng Nam",
                        image: "/assets/images/hoian.png",
                        firstVisitDate: new Date("2025-03-10"),
                        lastVisitDate: new Date("2026-06-20"),
                        visitCount: 2,
                    },
                    {
                        location: "Đà Lạt, Lâm Đồng",
                        image: "/assets/images/sanmay.png",
                        firstVisitDate: new Date("2025-01-02"),
                        lastVisitDate: new Date("2025-01-02"),
                        visitCount: 1,
                    },
                    {
                        location: "Nha Trang, Khánh Hòa",
                        image: "/assets/images/bien.png",
                        firstVisitDate: new Date("2025-05-15"),
                        lastVisitDate: new Date("2025-05-15"),
                        visitCount: 1,
                    },
                    {
                        location: "Lào Cai (Sapa)",
                        image: "/assets/images/sapa.jpg",
                        firstVisitDate: new Date("2025-09-01"),
                        lastVisitDate: new Date("2025-09-01"),
                        visitCount: 1,
                    },
                ],
                achievements: [
                    {
                        label: "Chinh phục Sapa",
                        icon: "bi-binoculars-fill",
                        color: "#0E5E3A",
                        unlockedAt: new Date(),
                    },
                    {
                        label: "Khám phá Hạ Long",
                        icon: "bi-anchor",
                        color: "#F97316",
                        unlockedAt: new Date(),
                    },
                    {
                        label: "Văn hóa Hội An",
                        icon: "bi-bank",
                        color: "#EAB308",
                        unlockedAt: new Date(),
                    },
                    {
                        label: "Biển xanh Phú Quốc",
                        icon: "bi-umbrella-fill",
                        color: "#06B6D4",
                        unlockedAt: new Date(),
                    },
                ],
                createdAt: cus.createdAt || new Date(),
            });
        }
        await User.insertMany(users);
        console.log(`Đã seed ${users.length} Users thành công!`);

        // Xử lý & Seed Categories
        console.log("Đang seed Categories...");
        const mappedCategories = rawCategories.map((cat) => ({
            ...cat,
            image: cat.image
                ? cat.image.replace("hinh/", "/assets/images/")
                : "",
        }));
        await Category.insertMany(mappedCategories);
        console.log(
            `Đã seed ${mappedCategories.length} Categories thành công!`,
        );

        // Xử lý & Seed Destinations
        console.log("Đang seed Destinations...");
        const mappedDestinations = rawDestinations.map((des) => ({
            ...des,
            image: des.image
                ? des.image.replace("hinh/", "/assets/images/")
                : "",
        }));
        await Destination.insertMany(mappedDestinations);
        console.log(
            `Đã seed ${mappedDestinations.length} Destinations thành công!`,
        );

        // Xử lý & Seed Tours
        console.log("Đang xử lý và seed Tours...");
        const tours = rawTours.map((t) => {
            // Phân loại danh mục dựa theo thuộc tính/tên điểm đến để khớp với doan Homepage/Listing
            let category = "Văn Hóa & Di Sản"; // default
            const dest = t.destination;
            const cats = t.categoryCodes || [];

            if (
                cats.includes("CAT004") ||
                dest === "Kiên Giang" ||
                dest === "Khánh Hòa" ||
                t.name.toLowerCase().includes("vịnh") ||
                t.name.toLowerCase().includes("biển") ||
                t.name.toLowerCase().includes("đảo")
            ) {
                category = "Du lịch biển";
            } else if (
                dest === "Cao Bằng" ||
                dest === "Lào Cai" ||
                t.name.toLowerCase().includes("sapa") ||
                t.name.toLowerCase().includes("hà giang") ||
                t.name.toLowerCase().includes("mây") ||
                t.name.toLowerCase().includes("vùng cao")
            ) {
                category = "Vùng Cao";
            }

            // Trích xuất số ngày từ duration (e.g. "3N2Đ" -> 3)
            let days = 1;
            if (t.duration) {
                const match =
                    t.duration.match(/(\d+)N/i) ||
                    t.duration.match(/(\d+)\s*ngày/i);
                if (match) days = parseInt(match[1]);
            }

            return {
                _id: t._id || t.code || t.slug, // Dùng _id có sẵn hoặc sinh từ code/slug
                code: t.code,
                slug: t.slug,
                title: t.name,
                name: t.name,
                location: t.location.address || t.destination,
                destination: t.destination,
                departure: t.departure || "Hà Nội",
                duration: t.duration,
                days: days,
                price: t.price,
                oldPrice: t.oldPrice,
                childPrice: t.childPrice || Math.round(t.price * 0.5),
                discount: t.discount || 0,
                service_fee_rate: 10,
                maxGuests: t.maxGuests || 30,
                availableSeats: t.availableSeats || 30,
                rating: t.rating || 0,
                rating_avg: t.rating || 0,
                reviewCount: t.reviewCount || 0,
                review_count: t.reviewCount || 0,
                viewCount: t.viewCount || 0,
                bookingCount: t.bookingCount || 0,
                image: t.thumbnail
                    ? t.thumbnail.replace("/images/", "/assets/images/")
                    : "",
                thumbnail: t.thumbnail
                    ? t.thumbnail.replace("/images/", "/assets/images/")
                    : "",
                images: (t.images || []).map((img) =>
                    img.replace("/images/", "/assets/images/"),
                ),
                gallery: (t.images || []).map((img) =>
                    img.replace("/images/", "/assets/images/"),
                ),
                description: t.description,
                highlights: t.highlights || [],
                included: t.included || [],
                includes: t.included || [],
                excluded: t.excluded || [],
                excludes: t.excluded || [],
                category: category,
                mood:
                    category === "Du lịch biển"
                        ? ["thư giãn", "gia đình"]
                        : category === "Vùng Cao"
                          ? ["phiêu lưu", "thiên nhiên"]
                          : ["văn hóa", "gia đình"],
                matchingTags: t.categoryCodes || [],
                weatherLocation:
                    t.destination === "Lào Cai"
                        ? "Sapa"
                        : t.destination === "Kiên Giang"
                          ? "Phu Quoc"
                          : t.destination === "Khánh Hòa"
                            ? "Nha Trang"
                            : t.destination,
                locationCoords: {
                    address: t.location.address,
                    lat: t.location.lat,
                    lng: t.location.lng,
                },
                meetingPoint: t.meetingPoint,
                virtual360: t.virtual360 || "",
                departureDates: t.departureDates || [],
                isFeatured: t.isFeatured || false,
                status: t.status || "Available",
                createdAt: t.createdAt || new Date(),
            };
        });
        await Tour.insertMany(tours);
        console.log(`Đã seed ${tours.length} Tours thành công!`);

        // Seed Reviews
        console.log("Đang seed Reviews...");
        // Lấy danh sách booking ID hợp lệ từ bookings đã seed
        const bookingIds = rawBookings.map((b) => b._id).filter(Boolean);
        const reviews = rawReviews.map((r, idx) => ({
            _id: r._id || `REV${String(idx + 1).padStart(3, "0")}`,
            booking_id: bookingIds[idx % bookingIds.length] || "BK001",
            user_id:
                r.customerCode || r.customer_id || r.customerId || "CUS001",
            tour_id: r.tourCode || r.tour_id || r.tourId,
            rating: r.rating,
            comment: r.comment,
            images: r.images || [],
            createdAt: r.createdAt || new Date(),
        }));
        await Review.insertMany(reviews);
        console.log(`Đã seed ${reviews.length} Reviews thành công!`);

        // Seed Bookings
        console.log("Đang seed Bookings...");
        const bookings = rawBookings.map((b, idx) => {
            const quantity = b.numberOfGuests || b.quantity || 1;
            const total = b.totalPrice || b.total_price || 0;
            const userId =
                b.customerCode || b.customer_id || b.customerId || "CUS001";
            const tourId = b.tourCode || b.tour_id || b.tourId;
            return {
                _id: b._id || `BK${String(idx + 1).padStart(3, "0")}`,
                user_id: userId,
                tour_id: tourId,
                departure_date: new Date(b.departureDate || b.departure_date),
                quantity: quantity,
                passengers: Array.from({ length: quantity }).map((_, i) => ({
                    fullname:
                        i === 0 ? "Nguyễn Minh Anh" : `Hành khách ${i + 1}`,
                    email: i === 0 ? "minhanh@gmail.com" : "",
                    phone: i === 0 ? "0901234567" : "",
                    passport_cccd: `B12345${idx}${i}`,
                })),
                total_price: total,
                service_fee: Math.round(total * 0.1),
                final_price: total,
                bill_split: [],
                booking_status: (() => {
                    const s = (b.status || "paid").toLowerCase();
                    if (
                        ["pending", "paid", "cancelled", "completed"].includes(
                            s,
                        )
                    )
                        return s;
                    return "paid";
                })(),
                payment_method: "bank_transfer",
                createdAt:
                    b.createdAt || b.bookingDate
                        ? new Date(b.createdAt || b.bookingDate)
                        : new Date(),
            };
        });
        await Booking.insertMany(bookings);
        console.log(`Đã seed ${bookings.length} Bookings thành công!`);

        console.log("Quá trình seed dữ liệu hoàn tất thành công tốt đẹp!");
        process.exit(0);
    } catch (error) {
        console.error("Lỗi khi seed dữ liệu:", error);
        process.exit(1);
    }
};

seedData();
