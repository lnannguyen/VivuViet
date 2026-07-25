require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Tour = require("./models/Tour");
const Booking = require("./models/Booking");
const Review = require("./models/Review");
const Category = require("./models/Category");
const Destination = require("./models/Destination");
const Voucher = require("./models/Voucher");

const seedData = async () => {
    try {
        console.log("Đang kết nối tới MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Kết nối MongoDB thành công!");

        console.log("[Safe Seed] Che do nap an toan - BEO VE 100% DU LIEU NGUOI DUNG THAT...");

        // 1. SEED CATEGORIES (Upsert - Thêm nếu chưa có, cập nhật nếu có)
        console.log("Đang đồng bộ Danh mục (Categories)...");
        const categories = [
            {
                _id: "CAT001",
                code: "CAT001",
                title: "Vùng Cao",
                name: "Vùng Cao",
                icon: "bi-mountain",
                image: "/assets/images/categories/vungcao.png",
                description: "Khám phá núi rừng hùng vĩ, mây ngàn và bản sắc văn hóa các dân tộc phía Bắc.",
            },
            {
                _id: "CAT002",
                code: "CAT002",
                title: "Du Lịch Biển",
                name: "Du lịch biển",
                icon: "bi-water",
                image: "/assets/images/categories/dulichbien.png",
                description: "Tận hưởng làn nước trong xanh, cát trắng và không khí biển trong lành tươi mát.",
            },
            {
                _id: "CAT003",
                code: "CAT003",
                title: "Văn Hóa & Di Sản",
                name: "Văn Hóa & Di Sản",
                icon: "bi-bank",
                image: "/assets/images/categories/vanhoa.png",
                description: "Hành trình ngược dòng thời gian tìm về di sản lịch sử và kiến trúc cổ kính.",
            },
        ];
        await Category.deleteOne({ _id: "CAT004" });
        for (const cat of categories) {
            await Category.updateOne({ _id: cat._id }, { $set: cat }, { upsert: true });
        }

        // 2. SEED DESTINATIONS (Upsert)
        console.log("Đang đồng bộ Điểm Đến (Destinations)...");
        const destinations = [
            { _id: "DES001", code: "DES001", name: "Sapa", description: "Thị trấn mộng mơ vùng Tây Bắc", image: "/assets/images/tours/sapa/fansipan_peak.jpg" },
            { _id: "DES002", code: "DES002", name: "Hạ Long", description: "Kỳ quan thiên nhiên thế giới", image: "/assets/images/tours/ha-long/halong_cruise.png" },
            { _id: "DES003", code: "DES003", name: "Hội An", description: "Phố cổ di sản văn hóa thế giới", image: "/assets/images/tours/hoi-an/phoco_hoian.png" },
            { _id: "DES004", code: "DES004", name: "Phú Quốc", description: "Thiên đường biển ngọc đảo ngọc", image: "/assets/images/tours/phu-quoc/phuquoc_beach.jpg" },
            { _id: "DES005", code: "DES005", name: "Cao Bằng", description: "Thác Bản Giốc và núi rừng Đông Bắc", image: "/assets/images/tours/cao-bang/bangioc_waterfall.jpg" },
            { _id: "DES006", code: "DES006", name: "Ninh Bình", description: "Di sản thế giới kép Tràng An", image: "/assets/images/tours/ninh-binh/trangan_landscape.jpg" },
            { _id: "DES007", code: "DES007", name: "Đà Nẵng", description: "Thành phố đáng sống bên sông Hàn", image: "/assets/images/tours/da-nang/golden_bridge.jpg" },
            { _id: "DES008", code: "DES008", name: "Hà Giang", description: "Công viên địa chất cao nguyên đá", image: "/assets/images/tours/cao-bang/mapileng_pass.jpg" },
        ];
        for (const des of destinations) {
            await Destination.updateOne({ _id: des._id }, { $set: des }, { upsert: true });
        }

        // 3. SEED USERS (Dùng $setOnInsert: Không bao giờ đè hay xóa người dùng đã đăng ký)
        console.log("Đang bảo vệ & bổ sung Người Dùng (Users)...");
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash("123456", salt);

        await User.deleteOne({ email: "anan265464@gmail.com" });
        await User.deleteOne({ _id: "USR001" });

        const defaultUsers = [
            {
                _id: "USR002",
                fullname: "Trần Văn Hùng",
                email: "hung.tran@gmail.com",
                phone: "0987654321",
                avatar: "/assets/images/avt/pngtree-art-boy-avatar-png-image_8855201.png",
                password: defaultPassword,
                auth_provider: "local",
                membership: "gold",
                wishlist: ["TOUR002"],
                notifications: [],
                vouchers: [],
                vivupoints: 250,
            },
            {
                _id: "USR003",
                fullname: "Lê Thị Phương Mai",
                email: "mai.le@gmail.com",
                phone: "0912345678",
                avatar: "/assets/images/avt/avt2.jpg",
                password: defaultPassword,
                auth_provider: "local",
                membership: "standard",
                wishlist: ["TOUR001"],
                notifications: [],
                vouchers: [],
                vivupoints: 180,
            },
            {
                _id: "USR004",
                fullname: "Phạm Quốc Bảo",
                email: "bao.pham@gmail.com",
                phone: "0938112233",
                avatar: "/assets/images/avt/av3.jpg",
                password: defaultPassword,
                auth_provider: "local",
                membership: "gold",
                wishlist: ["TOUR001"],
                notifications: [],
                vouchers: [],
                vivupoints: 320,
            },
            {
                _id: "USR005",
                fullname: "Nguyễn Thảo Nguyên",
                email: "thaonguyen@gmail.com",
                phone: "0977889900",
                avatar: "/assets/images/avt/av4.jpg",
                password: defaultPassword,
                auth_provider: "local",
                membership: "gold",
                wishlist: ["TOUR003"],
                notifications: [],
                vouchers: [],
                vivupoints: 450,
            },
        ];
        for (const u of defaultUsers) {
            await User.updateOne({ _id: u._id }, { $set: u }, { upsert: true });
        }

        // 4. SEED TOURS (Upsert)
        console.log("Đang đồng bộ Danh sách Tour...");
        const tours = [
            {
                _id: "TOUR001",
                code: "TOUR001",
                slug: "kham-pha-sapa-chinh-phuc-fansipan",
                title: "Khám phá Sapa - Chinh phục đỉnh Fansipan Nóc nhà Đông Dương",
                name: "Khám phá Sapa - Chinh phục Fansipan",
                location: "Sapa, Lào Cai, Việt Nam",
                destination: "Sapa",
                departure: "Hà Nội",
                duration: "3 Ngày 2 Đêm",
                days: 3,
                price: 3500000,
                oldPrice: 4200000,
                childPrice: 1750000,
                discount: 16,
                service_fee_rate: 10,
                maxGuests: 30,
                availableSeats: 24,
                rating: 4.9,
                rating_avg: 4.9,
                reviewCount: 18,
                review_count: 18,
                viewCount: 1420,
                bookingCount: 52,
                image: "/assets/images/tours/sapa/fansipan_peak.jpg",
                thumbnail: "/assets/images/tours/sapa/fansipan_peak.jpg",
                images: ["/assets/images/tours/sapa/fansipan_peak.jpg", "/assets/images/tours/sapa/fansipan_marker.jpg", "/assets/images/tours/sapa/catcat_village.jpg", "/assets/images/tours/sapa/sanmay_fansipan.jpg"],
                gallery: ["/assets/images/tours/sapa/fansipan_peak.jpg", "/assets/images/tours/sapa/fansipan_marker.jpg", "/assets/images/tours/sapa/catcat_village.jpg", "/assets/images/tours/sapa/sanmay_fansipan.jpg"],
                category: "Vùng Cao",
                description: "Hành trình đưa bạn khám phá thị trấn sương mù Sapa, check-in đỉnh Fansipan bằng cáp treo kỷ kỷ lục và trải nghiệm nét văn hóa bản địa độc đáo tại Bản Cát Cát.",
                itinerary: [
                    { day: 1, title: "Ngày 1: Hà Nội – Sapa – Bản Cát Cát", content: "Xe đón đoàn tại điểm hẹn khởi hành đi Sapa qua cao tốc Hà Nội - Lào Cai. Đến Sapa ăn trưa, nhận phòng. Chiều tham quan Bản Cát Cát, tìm hiểu nghề dệt thổ cẩm của người H'Mông." },
                    { day: 2, title: "Ngày 2: Chinh phục Cáp treo Fansipan – Thung lũng Mường Hoa", content: "Xe đưa quý khách đến ga cáp treo Fansipan, trải nghiệm hệ thống cáp treo 3 dây hiện đại chinh phục đỉnh Fansipan 3.143m. Chiều tham quan thung lũng Mường Hoa." },
                    { day: 3, title: "Ngày 3: Nhà thờ Đá – Chợ Sapa – Trở về Hà Nội", content: "Tự do dạo phố thưởng thức cà phê Sapa, mua sắm đặc sản măng trúc, thịt trâu gầy bếp. 13h00 lên xe trở về Hà Nội, kết thúc chuyến đi." },
                ],
                highlights: ["Cáp treo Fansipan 3 dây hiện đại", "Bản Cát Cát văn hóa đặc sắc", "Thưởng thức thắng cố và lẩu cá hồi Sapa"],
                included: ["Xe du lịch giường nằm đời mới", "Khách sạn 3-4 sao trung tâm", "Các bữa ăn theo chương trình", "Vé cáp treo Fansipan"],
                excluded: ["Chi phí cá nhân", "Tiền tip cho HDV và lái xe"],
                mood: ["phiêu lưu", "thiên nhiên", "thư giãn", "khám phá"],
                matchingTags: ["CAT001", "sapa", "fansipan"],
                weatherLocation: "Sapa",
                locationCoords: { address: "Thị trấn Sapa, Lào Cai", lat: 22.3364, lng: 103.8438 },
                meetingPoint: "Nhà hát Lớn Hà Nội - 06:00 AM",
                virtual360: "https://maps.google.com",
                departureDates: ["2026-08-01", "2026-08-15", "2026-09-02"],
                isFeatured: true,
                status: "Available",
            },
            {
                _id: "TOUR002",
                code: "TOUR002",
                slug: "du-thuyen-5-sao-vinh-ha-long",
                title: "Hành trình Du thuyền 5 Sao Vịnh Hạ Long – Hang Sung Sốt",
                name: "Hành trình Du thuyền 5 Sao Vịnh Hạ Long",
                location: "Vịnh Hạ Long, Quảng Ninh",
                destination: "Hạ Long",
                departure: "Hà Nội",
                duration: "2 Ngày 1 Đêm",
                days: 2,
                price: 4200000,
                oldPrice: 5000000,
                childPrice: 2100000,
                discount: 16,
                service_fee_rate: 10,
                maxGuests: 25,
                availableSeats: 12,
                rating: 4.8,
                rating_avg: 4.8,
                reviewCount: 24,
                review_count: 24,
                viewCount: 2150,
                bookingCount: 88,
                image: "/assets/images/tours/ha-long/halong_cruise.png",
                thumbnail: "/assets/images/tours/ha-long/halong_cruise.png",
                images: ["/assets/images/tours/ha-long/halong_cruise.png", "/assets/images/tours/ha-long/kayak_cave.jpg", "/assets/images/tours/ha-long/halong_panorama.jpg", "/assets/images/tours/ha-long/hangdong_thachnhu.jpg"],
                gallery: ["/assets/images/tours/ha-long/halong_cruise.png", "/assets/images/tours/ha-long/kayak_cave.jpg", "/assets/images/tours/ha-long/halong_panorama.jpg", "/assets/images/tours/ha-long/hangdong_thachnhu.jpg"],
                category: "Du lịch biển",
                description: "Nghỉ dưỡng thượng lưu trên du thuyền 5 sao giữa kỳ quan thiên nhiên thế giới Vịnh Hạ Long, chèo thuyền kayak và ngắm hoàng hôn rực rỡ.",
                itinerary: [
                    { day: 1, title: "Ngày 1: Hà Nội – Cảng Tuần Châu – Vịnh Hạ Long – Chèo Kayak", content: "Xe Limousine đón khách đi Tuần Châu. Check-in du thuyền 5 sao, dùng bữa trưa buffet hải sản. Chiều chèo kayak khám phá hang Trinh Nữ và tắm biển đảo Ti Tốp." },
                    { day: 2, title: "Ngày 2: Tập Thái Cực Quyền – Hang Sửng Sốt – Trở về Hà Nội", content: "Đón bình minh với bài tập Thái Cực Quyền trên sundeck. Tham quan Hang Sửng Sốt - hang động rộng và đẹp nhất vịnh. Ăn trưa nhẹ và làm thủ tục cập cảng về Hà Nội." },
                ],
                highlights: ["Du thuyền 5 sao đẳng cấp quốc tế", "Buffet hải sản tươi ngon", "Chèo thuyền Kayak ngắm cảnh kỳ quan"],
                included: ["Xe Limousine đưa đón 2 chiều", "Phòng sang trọng trên du thuyền", "Tất cả các bữa ăn theo lịch trình", "Vé tham quan vịnh"],
                excluded: ["Đồ uống cá nhân", "Dịch vụ massage spa"],
                mood: ["thư giãn", "gia đình", "khám phá"],
                matchingTags: ["CAT002", "halong", "duthuyen"],
                weatherLocation: "Ha Long",
                locationCoords: { address: "Vịnh Hạ Long, Quảng Ninh", lat: 20.9101, lng: 107.1839 },
                meetingPoint: "Cổng Phụ Nhà Hát Lớn - 07:30 AM",
                virtual360: "https://maps.google.com",
                departureDates: ["2026-08-05", "2026-08-12", "2026-08-20"],
                isFeatured: true,
                status: "Available",
            },
            {
                _id: "TOUR003",
                code: "TOUR003",
                slug: "kham-pha-thac-ban-gioc-cao-bang",
                title: "Khám phá Thác Bản Giốc – Động Ngườm Ngao – Hồ Ba Bể",
                name: "Khám phá Thác Bản Giốc - Cao Bằng",
                location: "Cao Bằng, Việt Nam",
                destination: "Cao Bằng",
                departure: "Hà Nội",
                duration: "3 Ngày 2 Đêm",
                days: 3,
                price: 2990000,
                oldPrice: 3500000,
                childPrice: 1495000,
                discount: 14,
                service_fee_rate: 10,
                maxGuests: 30,
                availableSeats: 18,
                rating: 4.7,
                rating_avg: 4.7,
                reviewCount: 12,
                review_count: 12,
                viewCount: 980,
                bookingCount: 36,
                image: "/assets/images/tours/cao-bang/bangioc_waterfall.jpg",
                thumbnail: "/assets/images/tours/cao-bang/bangioc_waterfall.jpg",
                images: ["/assets/images/tours/cao-bang/bangioc_waterfall.jpg", "/assets/images/tours/cao-bang/nguomngao_cave.jpg", "/assets/images/tours/cao-bang/babe_lake.jpg", "/assets/images/tours/cao-bang/mapileng_pass.jpg"],
                gallery: ["/assets/images/tours/cao-bang/bangioc_waterfall.jpg", "/assets/images/tours/cao-bang/nguomngao_cave.jpg", "/assets/images/tours/cao-bang/babe_lake.jpg", "/assets/images/tours/cao-bang/mapileng_pass.jpg"],
                category: "Vùng Cao",
                description: "Tận mắt chiêm ngưỡng Thác Bản Giốc - thác nước tự nhiên lớn nhất Đông Nam Á, khám phá vẻ đẹp ảo diệu của Động Ngườm Ngao và Hồ Ba Bể xanh mát.",
                itinerary: [
                    { day: 1, title: "Ngày 1: Hà Nội – Thái Nguyên – Cao Bằng", content: "Khởi hành đi Cao Bằng. Tham quan đèo Gió, đèo Khau Liêu. Ăn trưa tại Trùng Khánh. Tối tự do dạo chơi thành phố Cao Bằng." },
                    { day: 2, title: "Ngày 2: Thác Bản Giốc – Động Ngườm Ngao – Pắc Bó", content: "Chiêm ngưỡng vẻ đẹp Thác Bản Giốc hùng vĩ ranh giới Việt - Trung. Khám phá thạch nhũ lung linh trong Động Ngườm Ngao. Chiều viếng di tích Pắc Bó, suối Lê Nin." },
                    { day: 3, title: "Ngày 3: Cao Bằng – Ba Bể – Trở về Hà Nội", content: "Đi Hồ Ba Bể, đi xuồng máy tham quan đảo An Mạ, ao Tiên. Dùng bữa trưa cá nướng Ba Bể trước khi lên xe về Hà Nội." },
                ],
                highlights: ["Thác nước đẹp nhất Việt Nam", "Động Ngườm Ngao kỳ ảo", "Suối Lê Nin trong vắt như ngọc"],
                included: ["Xe ô tô du lịch máy lạnh", "Khách sạn đạt tiêu chuẩn", "Các bữa ăn chương trình", "Vé vào cổng tham quan"],
                excluded: ["Chi phí cá nhân ngoài chương trình"],
                mood: ["phiêu lưu", "thiên nhiên", "khám phá"],
                matchingTags: ["CAT001", "caobang", "bangioc"],
                weatherLocation: "Cao Bang",
                locationCoords: { address: "Trùng Khánh, Cao Bằng", lat: 22.8553, lng: 106.5862 },
                meetingPoint: "Rạp Xiếc Trung Ương - 06:30 AM",
                departureDates: ["2026-08-10", "2026-08-24"],
                isFeatured: true,
                status: "Available",
            },
            {
                _id: "TOUR004",
                code: "TOUR004",
                slug: "thien-duong-bien-ngoc-phu-quoc",
                title: "Thiên đường biển ngọc Phú Quốc – Cáp treo Hòn Thơm – Grand World",
                name: "Thiên đường biển ngọc Phú Quốc",
                location: "Phú Quốc, Kiên Giang",
                destination: "Phú Quốc",
                departure: "TP. Hồ Chí Minh",
                duration: "4 Ngày 3 Đêm",
                days: 4,
                price: 5800000,
                oldPrice: 6800000,
                childPrice: 2900000,
                discount: 15,
                service_fee_rate: 10,
                maxGuests: 30,
                availableSeats: 20,
                rating: 4.9,
                rating_avg: 4.9,
                reviewCount: 30,
                review_count: 30,
                viewCount: 3100,
                bookingCount: 110,
                image: "/assets/images/tours/phu-quoc/phuquoc_beach.jpg",
                thumbnail: "/assets/images/tours/phu-quoc/phuquoc_beach.jpg",
                images: ["/assets/images/tours/phu-quoc/phuquoc_beach.jpg", "/assets/images/tours/phu-quoc/honthom_cable.jpg", "/assets/images/tours/phu-quoc/vinpearl_safari.jpg", "/assets/images/tours/phu-quoc/hamninh_village.jpg"],
                gallery: ["/assets/images/tours/phu-quoc/phuquoc_beach.jpg", "/assets/images/tours/phu-quoc/honthom_cable.jpg", "/assets/images/tours/phu-quoc/vinpearl_safari.jpg", "/assets/images/tours/phu-quoc/hamninh_village.jpg"],
                category: "Du lịch biển",
                description: "Trải nghiệm trọn vẹn đảo ngọc Phú Quốc với tour cano 4 đảo lặn ngắm san hô, check-in Grand World thành phố không ngủ và công viên VinWonders.",
                itinerary: [
                    { day: 1, title: "Ngày 1: Đón Sân Bay Phú Quốc – Sunset Sanato – Grand World", content: "Đón khách tại sân bay Phú Quốc. Nhận phòng resort. Chiều check-in Sunset Sanato ngắm hoàng hôn đẹp nhất đảo. Tối tham quan Grand World sầm uất." },
                    { day: 2, title: "Ngày 2: Tour Cano 4 Đảo – Lặn Ngắm San Hô – Cáp treo Hòn Thơm", content: "Trải nghiệm cano siêu tốc tham quan Hòn Mây Rút, Hòn Gầm Ghì, Hòn Móng Tay. Lặn ngắm san hô thiên nhiên và đi cáp treo vượt biển Hòn Thơm." },
                    { day: 3, title: "Ngày 3: VinWonders & Vinpearl Safari", content: "Khám phá công viên chủ đề VinWonders và vườn thú bán hoang dã Vinpearl Safari quy mô lớn nhất Việt Nam." },
                    { day: 4, title: "Ngày 4: Dinh Cậu – Chợ Đêm Phú Quốc – Tiễn Sân Bay", content: "Mua sắm nước mắm truyền thống, hồ tiêu Phú Quốc và ngọc trai. Tiễn khách ra sân bay Phú Quốc." },
                ],
                highlights: ["Cano 4 đảo lặn san hô đỉnh cao", "Cáp treo vượt biển Hòn Thơm dài nhất thế giới", "Thành phố không ngủ Grand World"],
                included: ["Vé máy bay khứ hồi (nếu có)", "Resort 4 sao có bể bơi", "Xe đưa đón đảo Phú Quốc", "Tour cano 4 đảo"],
                excluded: ["Chi phí trò chơi riêng tại VinWonders"],
                mood: ["thư giãn", "gia đình", "khám phá"],
                matchingTags: ["CAT002", "phuquoc", "canodao"],
                weatherLocation: "Phu Quoc",
                locationCoords: { address: "Đảo Phú Quốc, Kiên Giang", lat: 10.2899, lng: 103.984 },
                meetingPoint: "Sân bay Phú Quốc - 10:00 AM",
                departureDates: ["2026-08-08", "2026-08-22"],
                isFeatured: true,
                status: "Available",
            },
            {
                _id: "TOUR005",
                code: "TOUR005",
                slug: "hanh-trinh-di-san-muyen-trung-hoi-an-hue",
                title: "Hành trình di sản Miền Trung: Hội An – Phố Cổ – Cố Đô Huế",
                name: "Hành trình di sản Hội An - Huế",
                location: "Hội An, Quảng Nam",
                destination: "Hội An",
                departure: "Đà Nẵng",
                duration: "4 Ngày 3 Đêm",
                days: 4,
                price: 3950000,
                oldPrice: 4600000,
                childPrice: 1975000,
                discount: 14,
                service_fee_rate: 10,
                maxGuests: 30,
                availableSeats: 15,
                rating: 4.8,
                rating_avg: 4.8,
                reviewCount: 20,
                review_count: 20,
                viewCount: 1650,
                bookingCount: 64,
                image: "/assets/images/tours/hoi-an/phoco_hoian.png",
                thumbnail: "/assets/images/tours/hoi-an/phoco_hoian.png",
                images: ["/assets/images/tours/hoi-an/phoco_hoian.png", "/assets/images/tours/hoi-an/denlong_hoian.jpg", "/assets/images/tours/hoi-an/chuacau_hoian.jpg", "/assets/images/tours/hoi-an/traque_village.jpg"],
                gallery: ["/assets/images/tours/hoi-an/phoco_hoian.png", "/assets/images/tours/hoi-an/denlong_hoian.jpg", "/assets/images/tours/hoi-an/chuacau_hoian.jpg", "/assets/images/tours/hoi-an/traque_village.jpg"],
                category: "Văn Hóa & Di Sản",
                description: "Hành trình đưa quý khách đến với phố cổ Hội An rực rỡ đèn lồng, Bà Nà Hills Cầu Vàng nổi tiếng thế giới và không gian cổ kính Cố đô Huế.",
                itinerary: [
                    { day: 1, title: "Ngày 1: Đà Nẵng – Phố cổ Hội An", content: "Xe đón đoàn tại Đà Nẵng. Đi Hội An tham quan Chùa Cầu, Nhà cổ Phùng Hưng. Tối thả đèn hoa đăng trên sông Hoài." },
                    { day: 2, title: "Ngày 2: Bà Nà Hills – Cầu Vàng – Đà Nẵng", content: "Đi cáp treo Bà Nà Hills check-in Cầu Vàng bàn tay khổng lồ, dạo bước Làng Pháp và chơi trò chơi tại Fantasy Park." },
                    { day: 3, title: "Ngày 3: Đà Nẵng – Cố Đô Huế – Đại Nội", content: "Khởi hành đi Huế qua hầm Hải Vân. Tham quan Đại Nội Kinh Thành Huế, Chùa Thiên Mụ cổ kính. Tối nghe ca Huế trên sông Hương." },
                    { day: 4, title: "Ngày 4: Lăng Khải Định – Mua sắm – Tiễn đoàn", content: "Tham quan Lăng Khải Định với kiến trúc mảnh sành độc đáo. Mua sắm đặc sản mắm tôm chua, nón lá Huế trước khi tiễn đoàn." },
                ],
                highlights: ["Cầu Vàng Bà Nà Hills nổi tiếng toàn cầu", "Phố cổ Hội An thơ mộng đèn lồng", "Nghe Ca Huế trên Sông Hương truyền thống"],
                included: ["Xe ô tô máy lạnh đời mới", "Khách sạn 3 sao trung tâm", "Ăn các bữa theo chương trình", "Vé tham quan các điểm"],
                excluded: ["Vé cáp treo Bà Nà Hills", "Chi phí cá nhân"],
                mood: ["văn hóa", "gia đình", "khám phá"],
                matchingTags: ["CAT003", "hoian", "hue"],
                weatherLocation: "Hoi An",
                locationCoords: { address: "Phố cổ Hội An, Quảng Nam", lat: 15.8801, lng: 108.338 },
                meetingPoint: "Sân bay Đà Nẵng - 09:00 AM",
                departureDates: ["2026-08-03", "2026-08-17"],
                isFeatured: true,
                status: "Available",
            },
            {
                _id: "TOUR006",
                code: "TOUR006",
                slug: "tuyet-tac-trang-an-bai-dinh-ninh-binh",
                title: "Tuyệt tác Tràng An – Chùa Bái Đính – Hang Múa Ninh Bình",
                name: "Tuyệt tác Tràng An - Ninh Bình",
                location: "Ninh Bình, Việt Nam",
                destination: "Ninh Bình",
                departure: "Hà Nội",
                duration: "1 Ngày",
                days: 1,
                price: 990000,
                oldPrice: 1200000,
                childPrice: 495000,
                discount: 17,
                service_fee_rate: 10,
                maxGuests: 40,
                availableSeats: 30,
                rating: 4.9,
                rating_avg: 4.9,
                reviewCount: 45,
                review_count: 45,
                viewCount: 2800,
                bookingCount: 150,
                image: "/assets/images/tours/ninh-binh/trangan_landscape.jpg",
                thumbnail: "/assets/images/tours/ninh-binh/trangan_landscape.jpg",
                images: ["/assets/images/tours/ninh-binh/trangan_landscape.jpg", "/assets/images/tours/ninh-binh/hangmua_peak.jpg", "/assets/images/tours/ninh-binh/baidinh_pagoda.jpg", "/assets/images/tours/ninh-binh/trangan_boat.jpg"],
                gallery: ["/assets/images/tours/ninh-binh/trangan_landscape.jpg", "/assets/images/tours/ninh-binh/hangmua_peak.jpg", "/assets/images/tours/ninh-binh/baidinh_pagoda.jpg", "/assets/images/tours/ninh-binh/trangan_boat.jpg"],
                category: "Văn Hóa & Di Sản",
                description: "Chuyến đi trong ngày trọn vẹn khám phá danh thắng Tràng An di sản thế giới kép, bái Phật tại đại danh chùa Bái Đính và ngắm toàn cảnh Tam Cốc từ Hang Múa.",
                itinerary: [
                    { day: 1, title: "Ngày 1: Hà Nội – Chùa Bái Đính – Tràng An – Hang Múa", content: "07h30 đón khách khởi hành đi Ninh Bình. Thăm Chùa Bái Đính ngôi chùa lớn nhất Đông Nam Á. Ăn trưa cơm cháy dê núi. Chiều đi thuyền Tràng An lướt qua các hang động kỳ vĩ. Leo 500 bậc đá Hang Múa ngắm đại panorama Tam Cốc. 19h30 về Hà Nội." },
                ],
                highlights: ["Di sản văn hóa & thiên nhiên thế giới Tràng An", "Đại danh chùa Bái Đính kỷ lục", "Hang Múa góc sống ảo triệu view"],
                included: ["Xe Limousine đưa đón Hà Nội", "Bữa ăn trưa đặc sản Ninh Bình", "Vé thuyền đò Tràng An", "Vé Hang Múa"],
                excluded: ["Xe điện tại Chùa Bái Đính", "Tiền tip HDV"],
                mood: ["văn hóa", "thiên nhiên", "khám phá"],
                matchingTags: ["CAT003", "ninhbinh", "trangan"],
                weatherLocation: "Ninh Binh",
                locationCoords: { address: "Tràng An, Ninh Bình", lat: 20.2506, lng: 105.9745 },
                meetingPoint: "Nhà hát Lớn Hà Nội - 07:30 AM",
                departureDates: ["Hàng ngày"],
                isFeatured: true,
                status: "Available",
            },
        ];
        for (const t of tours) {
            await Tour.updateOne({ _id: t._id }, { $set: t }, { upsert: true });
        }

        // 5. SEED VOUCHERS (Upsert)
        console.log("Đang đồng bộ Mã Giảm Giá (Vouchers)...");
        const globalVouchers = [
            {
                code: "HOTEL20",
                discount_amount: 500000,
                description: "Giảm 20% đặt phòng khách sạn đối tác VivuViet",
                max_uses: 1000,
                used_count: 15,
                valid_until: new Date("2026-12-31"),
            },
            {
                code: "FLIGHT500K",
                discount_amount: 500000,
                description: "Tặng 500k khi đặt vé máy bay khứ hồi",
                max_uses: 500,
                used_count: 42,
                valid_until: new Date("2026-12-31"),
            },
            {
                code: "FOOD15",
                discount_amount: 150000,
                description: "Giảm 15% ẩm thực cung đình tại các nhà hàng đối tác",
                max_uses: 300,
                used_count: 12,
                valid_until: new Date("2026-12-31"),
            },
            {
                code: "PICKUP100K",
                discount_amount: 100000,
                description: "Miễn phí 100k xe đưa đón sân bay",
                max_uses: 500,
                used_count: 20,
                valid_until: new Date("2026-12-31"),
            },
            {
                code: "SPA25",
                discount_amount: 250000,
                description: "Giảm 25% dịch vụ Spa & Massage thảo mộc",
                max_uses: 200,
                used_count: 8,
                valid_until: new Date("2026-12-31"),
            },
            {
                code: "VIVUVIET2026",
                discount_amount: 300000,
                description: "Giảm 300k cho đơn hàng từ 2.000.000đ",
                max_uses: 1000,
                used_count: 15,
                valid_until: new Date("2026-12-31"),
            },
            {
                code: "WELCOME200K",
                discount_amount: 200000,
                description: "Giảm 200k chào mừng thành viên mới",
                max_uses: 500,
                used_count: 42,
                valid_until: new Date("2026-12-31"),
            },
            {
                code: "SUMMER2026",
                discount_amount: 500000,
                description: "Giảm 500k ưu đãi mùa hè rực rỡ",
                max_uses: 200,
                used_count: 8,
                valid_until: new Date("2026-09-30"),
            },
        ];
        for (const v of globalVouchers) {
            await Voucher.updateOne({ code: v.code }, { $set: v }, { upsert: true });
        }

        // 6. SEED BOOKINGS
        console.log("Đang đồng bộ Đơn Đặt Tour (Bookings)...");
        await Booking.deleteMany({ user_id: "USR001" });
        await Booking.deleteMany({ _id: { $in: ["BK1001", "BK1002"] } });
        const defaultBookings = [];
        for (const b of defaultBookings) {
            await Booking.updateOne({ _id: b._id }, { $set: b }, { upsert: true });
        }

        // 7. SEED REVIEWS
        console.log("Đang đồng bộ Đánh Giá (Reviews)...");
        await Review.deleteMany({ user_id: "USR001" });
        const defaultReviews = [
            {
                _id: "REV001",
                booking_id: "BK001",
                user_id: "USR003",
                tour_id: "TOUR006",
                rating: 5,
                comment: "Đi Ninh Bình 1 ngày gọn nhẹ mà tham quan được nhiều điểm đẹp. Tràng An nước trong vắt, Hang Múa chụp hình siêu ảo!",
                images: ["/assets/images/ninhbinh.png"],
                createdAt: new Date("2026-06-15"),
            },
            {
                _id: "REV002",
                booking_id: "BK002",
                user_id: "USR002",
                tour_id: "TOUR002",
                rating: 5,
                comment: "Du thuyền 5 sao trên Vịnh Hạ Long rất sang trọng. Đồ ăn hải sản tươi ngon, chèo thuyền kayak rất vui!",
                images: ["/assets/images/halong.png"],
                createdAt: new Date("2026-06-20"),
            },
            {
                _id: "REV003",
                booking_id: "BK003",
                user_id: "USR004",
                tour_id: "TOUR001",
                rating: 5,
                comment: "Tour Sapa săn mây tuyệt đẹp! Khách sạn 4 sao sạch sẽ, hướng dẫn viên chu đáo nhiệt tình lắm!",
                images: ["/assets/images/sapa.jpg"],
                createdAt: new Date("2026-07-01"),
            },
            {
                _id: "REV004",
                booking_id: "BK004",
                user_id: "USR005",
                tour_id: "TOUR003",
                rating: 5,
                comment: "Phú Quốc nước biển xanh trong vắt như ngọc, đi tour cano 4 đảo ngắm san hô thiên nhiên rất thích!",
                images: ["/assets/images/phuquoc.png"],
                createdAt: new Date("2026-07-10"),
            },
        ];
        for (const r of defaultReviews) {
            await Review.updateOne({ _id: r._id }, { $set: r }, { upsert: true });
        }

        console.log("=========================================");
        console.log("[DONG BO DU LIEU AN TOAN THANH CONG]");
        console.log("   (Du lieu nguoi dung & don hang that duoc bao ve 100%)");
        console.log("=========================================");

        process.exit(0);
    } catch (error) {
        console.error("Lỗi khi seed dữ liệu:", error);
        process.exit(1);
    }
};

seedData();
