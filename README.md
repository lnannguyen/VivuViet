# VivuViet Travel Platform

VivuViet là nền tảng website đặt tour du lịch Việt Nam toàn diện, kết hợp các xu hướng công nghệ hiện đại nhằm mang lại trải nghiệm cá nhân hóa tốt nhất cho du khách. Hệ thống được xây dựng trên mô hình Client-Server hiện đại, tách biệt hoàn toàn giữa Frontend tĩnh và Backend cung cấp RESTful API.

🌐 **Demo trực tuyến:** [https://vivuviet.onrender.com](https://vivuviet.onrender.com)

---

## Tính năng nổi bật

### 1. Khám phá & Cá nhân hóa trải nghiệm
*   **Tìm kiếm & gợi ý tự động (Autocomplete Search):** Tìm kiếm tour nhanh chóng theo từ khóa điểm đến với hộp gợi ý kết quả thời gian thực.
*   **Lọc tour theo cảm xúc (Tour Mood):** Hệ thống gợi ý nhanh hành trình dựa trên tâm trạng du khách (Thư giãn, Gia đình, Khám phá, Lãng mạn, Văn hóa).
*   **Cảm hứng du lịch (Inspiration Filter):** Gợi ý tour theo danh mục địa hình phổ biến (Du lịch Biển đảo, Vùng cao, Di tích lịch sử) với bộ lọc tức thì không cần tải lại trang.

### 2. Chi tiết chuyến đi trực quan
*   **Virtual Tour 360°:** Trải nghiệm không gian thực tế ảo 360 độ trực quan tại các điểm đến trước khi đi.
*   **Bản đồ hành trình (Google Maps Route):** Nhúng bản đồ lộ trình di chuyển trực quan cho từng tour du lịch cụ thể.
*   **Lịch trình theo ngày (Itinerary Accordion):** Xem lịch trình chi tiết từng ngày dưới dạng hộp đóng/mở mượt mà.

### 3. Đặt tour & Thanh toán thông minh
*   **Đặt chỗ linh hoạt (Booking Engine):** Lựa chọn ngày đi khả dụng, số lượng khách (tự động tính giá vé người lớn/trẻ em).
*   **Thanh toán trực tuyến VNPay:** Tích hợp cổng thanh toán VNPay Sandbox với ký số HMAC-SHA512, hỗ trợ thanh toán qua thẻ ATM/tài khoản ngân hàng.
*   **Thanh toán mã QR động:** Tự động sinh mã QR chuyển khoản chứa đúng số tiền và cú pháp giao dịch giúp thanh toán nhanh gọn qua các ứng dụng ngân hàng.
*   **Hệ thống Voucher & Khuyến mãi:** Áp dụng voucher giảm giá trực tiếp vào hóa đơn đặt tour.

### 4. Quản lý tài khoản & Đánh giá chuyến đi
*   **Thành viên & Điểm thưởng (VivuPoints):** Tích lũy VivuPoints khi hoàn thành chuyến đi hoặc viết đánh giá để nâng hạng thành viên (Vàng, Bạc, Đồng) và đổi mã giảm giá.
*   **Lịch sử & trạng thái đặt tour:** Theo dõi trạng thái đơn đặt (Chờ thanh toán, Đã thanh toán, Đã hoàn thành, Đã hủy) và gửi yêu cầu hủy đơn tự động trực tiếp trên hệ thống.
*   **Đánh giá đa phương tiện (Multimedia Reviews):** Cho phép người dùng chấm điểm sao, bình luận và đính kèm tối đa 3 hình ảnh cùng 2 video thực tế từ chuyến đi.

---

## Công nghệ sử dụng

### Frontend (Client-side)
*   **HTML5 & CSS3 (Vanilla):** Xây dựng cấu trúc ngữ nghĩa và phong cách thiết kế hiện đại (Glassmorphism, Soft Shadows, Micro-animations).
*   **JavaScript (ES6+):** Xử lý logic động, điều hướng tab, gọi API không đồng bộ qua Fetch API.
*   **Bootstrap 5.3.3 & Bootstrap Icons:** Đảm bảo khả năng hiển thị tương thích hoàn toàn (Responsive Design) trên Desktop, Tablet, và Mobile.

### Backend (Server-side)
*   **Node.js & Express.js:** Xây dựng máy chủ web và các định tuyến dịch vụ RESTful API.
*   **JSON Web Token (JWT):** Xác thực tài khoản người dùng và bảo mật phiên làm việc phi trạng thái.
*   **BcryptJS:** Mã hóa một chiều mật khẩu người dùng trước khi lưu trữ vào cơ sở dữ liệu.
*   **Multer & Cloudinary Cloud Storage:** Xử lý upload tệp đa phương tiện (ảnh đại diện, ảnh/video đánh giá tour) lưu trữ trực tiếp trên mây Cloudinary vĩnh viễn với cơ chế sao lưu cục bộ an toàn.
*   **VNPay (HMAC-SHA512):** Tích hợp cổng thanh toán VNPay Sandbox với ký số bảo mật.

### Cơ sở dữ liệu (Database)
*   **MongoDB Atlas:** Cơ sở dữ liệu NoSQL đám mây lưu trữ dữ liệu dạng tài liệu JSON động.
*   **Mongoose:** ODM (Object Document Mapper) quản lý Schema và tương tác dữ liệu MongoDB.

### Triển khai (Deployment)
*   **Render.com:** Nền tảng cloud triển khai máy chủ Backend + Frontend tĩnh tại `https://vivuviet.onrender.com`.

---

## Cấu trúc thư mục dự án

```text
VivuViet/
├── frontend/                 # Giao diện người dùng (Client)
│   ├── assets/               # Hình ảnh, logo, video, avatar của hệ thống
│   ├── booking/              # Giao diện đặt tour và thanh toán hóa đơn
│   ├── coming-soon/          # Các trang chờ phát triển
│   ├── css/                  # File style hệ thống thiết kế toàn cục (Global Style)
│   ├── js/                   # Thư viện dùng chung (Auth, Search dropdown, Chatbox)
│   ├── login/                # Trang đăng nhập tài khoản
│   ├── profile/              # Trang cá nhân người dùng, lịch sử đặt, đánh giá
│   ├── register/             # Trang đăng ký tài khoản mới
│   ├── tour-detail/          # Trang xem chi tiết lịch trình tour và Virtual Tour
│   ├── tours/                # Trang danh sách tour và bộ lọc đa năng
│   └── index.html            # Trang chủ hệ thống
│
└── backend/                  # Mã nguồn máy chủ (Server API)
    ├── backup/               # Thư mục chứa 7 file sao lưu dữ liệu dạng JSON
    ├── config/               # Cấu hình kết nối Cloudinary Cloud Storage
    ├── controllers/          # Logic xử lý nghiệp vụ các module API
    ├── middleware/           # Middleware xác thực JWT và kiểm tra quyền truy cập
    ├── models/               # Cấu trúc lược đồ dữ liệu MongoDB (Mongoose Schemas)
    ├── routes/               # Cấu trúc định tuyến API endpoints
    ├── services/             # Dịch vụ gửi email tự động và các helper khác
    ├── .env                  # Cấu hình biến môi trường (Database URI, JWT Secret, VNPay, Cloudinary)
    ├── export_json.js        # Script tự động trích xuất sao lưu dữ liệu ra JSON
    ├── seed.js               # Kịch bản nạp dữ liệu mẫu ban đầu (Tours, Users, Vouchers, Reviews)
    └── server.js             # File khởi động máy chủ chính
```

---

## Cài đặt và Khởi chạy

### Bước 1: Chuẩn bị môi trường
*   Cài đặt **Node.js** phiên bản mới nhất.
*   Chuẩn bị sẵn một cụm cơ sở dữ liệu **MongoDB Atlas** hoặc cài đặt **MongoDB Community Server** chạy cục bộ.

### Bước 2: Cấu hình Backend
1.  Truy cập vào thư mục `backend`:
    ```bash
    cd backend
    ```
2.  Cài đặt các gói phụ thuộc (dependencies):
    ```bash
    npm install
    ```
3.  Tạo file `.env` tại thư mục gốc của `backend` và cấu hình các thông số sau:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key

    # Cấu hình cổng thanh toán VNPay
    VNPAY_TMN_CODE=your_vnpay_tmn_code
    VNPAY_HASH_SECRET=your_vnpay_hash_secret
    VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
    VNPAY_RETURN_URL=http://localhost:5000/api/payment/vnpay-return

    # Cấu hình lưu trữ đám mây Cloudinary
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

### Bước 3: Nạp dữ liệu mẫu ban đầu (Seeding Database)
Chạy lệnh sau trong thư mục `backend` để nạp đầy đủ danh sách tour, điểm đến, mã giảm giá và đánh giá mẫu vào MongoDB:
```bash
npm run seed
```

### Bước 4: Khởi chạy máy chủ Backend
Khởi chạy server ở chế độ phát triển (tự động tải lại khi đổi mã nguồn):
```bash
npm run dev
```
Máy chủ sẽ chạy tại địa chỉ: `http://localhost:5000`

### Bước 5: Chạy giao diện Frontend
*   Phần Frontend tĩnh đã được cấu hình phục vụ tĩnh (static serve) trực tiếp bởi Backend Express Server tại địa chỉ **`http://localhost:5000/`**. Bạn chỉ cần mở trình duyệt và truy cập địa chỉ này để bắt đầu trải nghiệm hệ thống VivuViet.
*   *Lưu ý:* Bạn cũng có thể chạy độc lập thư mục `frontend` bằng công cụ **Live Server** (mặc định trên cổng `5500` hoặc `3000`). Frontend được lập trình tự động cấu hình giao tiếp chéo nguồn (CORS) an toàn tới Backend.

---

## Tài khoản thử nghiệm mặc định
Để thử nghiệm đầy đủ các tính năng đặt chỗ, thanh toán, đánh giá chuyến đi, bạn có thể đăng nhập bằng tài khoản thành viên Gold mặc định sau:
*   **Email:** `anan265464@gmail.com`
*   **Mật khẩu:** `123456`

---

## Thông tin thẻ thử nghiệm VNPay Sandbox
Khi thực hiện giao diện thanh toán qua cổng VNPay Sandbox, bạn có thể sử dụng thông tin thẻ thử nghiệm sau để hoàn tất giao dịch:
*   **Ngân hàng:** NCB
*   **Số thẻ:** 9704198526191432198
*   **Tên chủ thẻ:** NGUYEN VAN A
*   **Ngày phát hành:** 07/15
*   **Mật khẩu OTP:** 123456
