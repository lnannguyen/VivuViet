# VivuViet Backend API Service

Đây là mã nguồn phía máy chủ (Server-side) của nền tảng đặt tour du lịch VivuViet, được xây dựng dựa trên NodeJS, ExpressJS và MongoDB. Máy chủ cung cấp toàn bộ các định tuyến RESTful API bảo mật phục vụ cho hoạt động tương tác, đặt chỗ, thanh toán và đánh giá của người dùng.

---

## Các tính năng chính

*   **Xác thực người dùng:** Đăng ký, đăng nhập tài khoản khách hàng, mã hóa mật khẩu một chiều bằng bcryptjs và quản lý phiên đăng nhập qua JSON Web Token (JWT).
*   **Quản lý thông tin & Upload ảnh đại diện:** Cho phép cập nhật thông tin cá nhân và tải lên ảnh đại diện trực tiếp thông qua thư viện Multer.
*   **Tìm kiếm & Lọc Tour du lịch:** Truy xuất danh sách tour, tìm kiếm theo từ khóa điểm đến, lọc nâng cao theo khoảng giá, số ngày đi, thể loại (Biển, Vùng cao, Di tích) và tâm trạng (Tour Mood).
*   **Quản lý Đặt chỗ (Booking Lifecycle):** Xử lý đặt tour, kiểm tra số chỗ trống khả dụng thời gian thực, lưu trữ lịch sử đặt chỗ và tiếp nhận yêu cầu hủy tour tự động cộng trả lại số chỗ trống cho cơ sở dữ liệu.
*   **Đánh giá đa phương tiện & Tích lũy điểm:** Người dùng đánh giá chuyến đi sau khi hoàn thành bằng cách chấm điểm sao, bình luận và tải lên tối đa 3 ảnh cùng 2 video, nhận điểm thưởng VivuPoints tương ứng.
*   **Đổi điểm lấy Voucher:** Quy đổi điểm tích lũy VivuPoints hiện có thành các mã giảm giá tương ứng áp dụng trực tiếp cho hóa đơn đặt tour tiếp theo.
*   **Tích hợp thanh toán trực tuyến VNPay:** Hỗ trợ cổng thanh toán VNPay Sandbox, tự động ký số bằng thuật toán HMAC-SHA512 để sinh link giao dịch an toàn và nhận diện kết quả chuyển tiền để tự động cập nhật trạng thái đơn hàng.

---

## Công nghệ sử dụng

*   **NodeJS:** Môi trường thực thi JavaScript phía máy chủ.
*   **ExpressJS:** Framework web gọn nhẹ dùng để định tuyến và kiểm soát Middleware.
*   **MongoDB Atlas (Mongoose ODM):** Cơ sở dữ liệu NoSQL để lưu trữ cấu trúc tour, booking, review, voucher và user.
*   **JSON Web Token (JWT):** Tạo token xác thực bảo mật tài khoản người dùng.
*   **BcryptJS:** Mã hóa một chiều mật khẩu người dùng trước khi lưu trữ.
*   **Multer:** Middleware phục vụ cho việc tải lên tệp ảnh, video từ Client lên đĩa máy chủ.
*   **Moment:** Định dạng thời gian chuẩn đầu vào cho các tham số VNPay.
*   **Crypto:** Thư viện mã hóa tích hợp của NodeJS dùng để ký chữ ký số bảo mật HMAC-SHA512.
*   **CORS & Dotenv:** Quản lý chia sẻ tài nguyên chéo nguồn và bảo mật cấu hình ứng dụng thông qua biến môi trường.

---

## Cấu trúc thư mục Backend

```text
backend/
├── controllers/          # Logic xử lý nghiệp vụ các module API
│   ├── authController.js     # Đăng ký, đăng nhập
│   ├── userController.js     # Chỉnh sửa hồ sơ, cập nhật avatar
│   ├── tourController.js     # Lấy danh sách, chi tiết, tìm kiếm tour
│   ├── bookingController.js  # Tạo đơn, xem lịch sử, hủy đơn, hoàn thành tour
│   ├── voucherController.js  # Lấy danh sách voucher, đổi điểm thưởng
│   ├── reviewController.js   # Gửi đánh giá chuyến đi kèm ảnh/video
│   └── paymentController.js  # Sinh URL thanh toán VNPay và xử lý callback ipn
│
├── middleware/           # Middleware xác thực và kiểm soát lỗi
│   └── authMiddleware.js     # Middleware giải mã và xác minh JWT Token
│
├── models/               # Cấu trúc Mongoose Schemas lưu trữ MongoDB
│   ├── User.js               # Tài khoản, thông báo, tích lũy điểm thưởng
│   ├── Tour.js               # Tour du lịch, chi tiết lịch trình, số ghế
│   ├── Booking.js            # Thông tin đặt tour, trạng thái đơn đặt
│   ├── Review.js             # Nhận xét, số sao, danh sách ảnh/video
│   └── Voucher.js            # Danh sách mã giảm giá và điểm đổi tương ứng
│
├── routes/               # Định tuyến yêu cầu HTTP tới controller tương ứng
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── tourRoutes.js
│   ├── bookingRoutes.js
│   ├── voucherRoutes.js
│   ├── reviewRoutes.js
│   └── paymentRoutes.js      # Định tuyến thanh toán VNPay
│
├── services/             # Dịch vụ gửi email và các hàm hỗ trợ khác
│   └── emailService.js       # Dịch vụ gửi thư xác nhận đặt tour tự động
│
├── .env                  # Lưu trữ cấu hình biến môi trường
├── seed.js               # Script khởi tạo danh sách tour mẫu
├── seed_voucher.js       # Script khởi tạo danh sách voucher giảm giá mẫu
├── seed_reviews.js       # Script khởi tạo danh sách bình luận mẫu
└── server.js             # File chạy khởi động máy chủ API chính
```

---

## Chi tiết các định tuyến API Endpoints

### 1. Xác thực tài khoản (Authentication API)
*   `POST /api/auth/register`: Đăng ký tài khoản khách hàng mới.
    *   *Payload:* `{ name, email, password }`
*   `POST /api/auth/login`: Đăng nhập hệ thống, trả về Token JWT.
    *   *Payload:* `{ email, password }`

### 2. Quản lý người dùng (Users API)
*   `GET /api/users/profile`: Lấy thông tin tài khoản của người dùng đăng nhập hiện tại (yêu cầu Authorization Header).
*   `PUT /api/users/profile`: Cập nhật thông tin cơ bản.
    *   *Payload:* `{ name, phone }`
*   `POST /api/users/avatar`: Tải lên và thay đổi ảnh đại diện cá nhân (gửi định dạng `multipart/form-data` chứa file `avatar`).

### 3. Tour du lịch (Tours API)
*   `GET /api/tours`: Lấy danh sách các tour du lịch. Hỗ trợ query parameters lọc theo danh mục:
    *   `?search=keyword`: Tìm kiếm theo từ khóa.
    *   `?mood=thugian`: Lọc theo tâm trạng du khách.
    *   `?category=bien`: Lọc theo cảm hứng điểm đến (Biển, Vùng cao, Di tích).
    *   `?priceMin=1000000&priceMax=5000000`: Lọc theo khoảng giá.
*   `GET /api/tours/:id`: Xem thông tin chi tiết một tour cụ thể cùng các đánh giá.

### 4. Đặt tour & Trạng thái (Bookings API)
*   `POST /api/bookings`: Đặt tour du lịch mới (yêu cầu Authorization Header).
    *   *Payload:* `{ tour_id, departure_date, quantity, passengers: [...] }`
*   `GET /api/bookings/my`: Xem danh sách tất cả các tour đã đặt của tài khoản hiện tại.
*   `PUT /api/bookings/:id/cancel`: Người dùng gửi yêu cầu hủy đặt tour trước ngày khởi hành. Trạng thái chuyển thành `cancelled` và tự động khôi phục số ghế trống cho Tour.
*   `PUT /api/bookings/:id/complete`: Hoàn thành tour để nhận điểm VivuPoints.

### 5. Mã giảm giá (Vouchers API)
*   `GET /api/vouchers`: Xem danh sách tất cả các voucher đang hoạt động.
*   `POST /api/vouchers/redeem`: Quy đổi điểm thưởng VivuPoints sang voucher.
    *   *Payload:* `{ voucherId }`

### 6. Đánh giá (Reviews API)
*   `POST /api/reviews`: Viết đánh giá sau khi hoàn thành chuyến đi (gửi định dạng `multipart/form-data` chứa file `images`, `videos` và các thuộc tính `tour_id`, `booking_id`, `rating`, `comment`).

### 7. Tích hợp thanh toán trực tuyến (Payments API)
*   `POST /api/payments/create`: Khởi tạo liên kết giao dịch và tạo URL thanh toán VNPay Sandbox tương ứng với đơn hàng (yêu cầu Authorization Header).
    *   *Payload:* `{ booking_id }`
    *   *Response:* `{ paymentUrl }` (Đường dẫn chuyển tiếp người dùng đến cổng thanh toán VNPay Sandbox)
*   `GET /api/payments/vnpay-return`: Nhận dữ liệu điều hướng quay lại (callback redirect) từ cổng VNPay sau khi khách hàng hoàn thành giao dịch:
    *   Thực hiện giải mã chữ ký số để xác minh tính hợp pháp của dữ liệu nhận được.
    *   Nếu chữ ký số hợp lệ và phản hồi giao dịch thành công (`vnp_ResponseCode === "00"`), cập nhật thuộc tính đơn hàng thành: `booking_status: "paid"` và `payment_method: "vnpay"`.
    *   Tự động chuyển hướng (Redirect) Client về trang thông báo thanh toán thành công `http://localhost:5000/booking/success?payment_method=vnpay` hoặc trang thất bại `/booking/failed`.

---

## Cấu hình và Khởi chạy

### 1. Khai báo biến môi trường (.env)
Tạo file `.env` tại thư mục gốc backend và cấu hình các thuộc tính:
```env
PORT=5000
MONGO_URI=mongodb_connection_string
JWT_SECRET=your_secret_jwt_signature_key

# Cấu hình cổng thanh toán VNPay
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5000/api/payments/vnpay-return
```

### 2. Cài đặt các gói phụ thuộc
Trong thư mục `backend`, chạy lệnh:
```bash
npm install
```

### 3. Khởi tạo cơ sở dữ liệu mẫu ban đầu
Chạy các script seeding để nạp dữ liệu mẫu vào MongoDB:
```bash
npm run seed
node seed_voucher.js
node seed_reviews.js
```

### 4. Chạy máy chủ ở chế độ phát triển
Để khởi chạy máy chủ cùng nodemon tự động phát hiện thay đổi mã nguồn:
```bash
npm run dev
```
Máy chủ API sẽ chạy trực tiếp tại: `http://localhost:5000`

---

## Thông tin thẻ thử nghiệm VNPay Sandbox
Khi thực hiện thanh toán thử nghiệm qua cổng VNPay Sandbox, sử dụng thông tin thẻ sau để giao dịch thành công:
*   **Ngân hàng:** NCB
*   **Số thẻ:** 9704198526191432198
*   **Tên chủ thẻ:** NGUYEN VAN A
*   **Ngày phát hành:** 07/15
*   **Mật khẩu OTP:** 123456

