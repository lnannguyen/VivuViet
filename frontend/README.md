# VivuViet Frontend Application

Đây là mã nguồn giao diện người dùng (Client-side) của nền tảng đặt tour du lịch VivuViet. Giao diện được thiết kế hiện đại, mượt mà và tương thích hoàn toàn trên tất cả các loại thiết bị di động, máy tính bảng và máy tính để bàn. Giao diện tương tác hoàn toàn trực quan với cơ chế Client-side rendering bằng JavaScript thuần kết nối tới RESTful API của Backend.

---

## Danh sách các trang chức năng

### 1. Trang chủ (index.html)
*   **Banner hình ảnh:** Slide ảnh chất lượng cao giới thiệu vẻ đẹp thiên nhiên Việt Nam.
*   **Thanh tìm kiếm nhanh:** Tích hợp hộp tìm kiếm tự động gợi ý điểm đến (Autocomplete dropdown) khi người dùng đang nhập từ khóa.
*   **Khu vực Tour nổi bật:** Hiển thị lưới các tour bán chạy nhất kèm thông tin đánh giá sao, ngày khởi hành và mức giá.
*   **Gợi ý Tour theo cảm xúc (Tour Mood):** Nút bấm lọc nhanh các tour theo tâm trạng như thư giãn, gia đình, khám phá, văn hóa.
*   **Cảm hứng hành trình:** Bộ lọc nhanh theo các loại địa hình phổ biến như biển, vùng cao, di tích.

### 2. Trang danh sách Tour (tours/tours.html)
*   **Giao diện lưới thẻ (Grid card layout):** Trực quan hóa danh sách tour kèm badge phân loại.
*   **Bộ lọc bên trái (Sidebar Filter):**
    *   Lọc nhanh theo danh mục địa hình (Biển, Vùng cao, Di tích).
    *   Thanh trượt chọn khoảng giá mong muốn (Price Range Slider).
    *   Lọc theo thời gian đi (số ngày mong muốn).
    *   Lọc kết quả lập tức bằng JavaScript mà không cần tải lại toàn bộ trang.
*   **Hộp sắp xếp (Sort):** Sắp xếp kết quả theo giá tăng/giảm dần hoặc xếp hạng sao đánh giá.

### 3. Trang chi tiết Tour (tour-detail/tour-detail.html)
*   **Slide hình ảnh:** Bộ ảnh thực tế chất lượng cao về địa điểm.
*   **Bảng tóm tắt thông tin:** Thời gian, giá vé, phương tiện, số ghế trống.
*   **Hộp lịch trình thu gọn (Accordion Itinerary):** Nội dung lịch trình từng ngày được ẩn/hiện mượt mà khi nhấp chuột.
*   **Trải nghiệm thực tế ảo (Virtual Tour 360 độ):** Nhúng ảnh góc rộng Panorama 360 độ giúp người dùng tương tác xoay góc nhìn thực tế tại điểm đến.
*   **Bản đồ chỉ đường (Google Maps):** Bản đồ động chỉ đường tuyến trình đi cụ thể của tour.

### 4. Trang đặt chỗ (booking/booking.html)
*   **Lịch chọn ngày:** Chọn ngày đi khả dụng từ cơ sở dữ liệu.
*   **Chọn số lượng hành khách:** Nhập số khách người lớn/trẻ em, tự động nhân đơn giá tính ra tổng tiền tạm tính.
*   **Form thông tin hành khách:** Điền họ tên, số điện thoại, email liên hệ nhận vé điện tử.

### 5. Trang thanh toán (booking/payment.html)
*   **Tóm tắt đơn hàng:** Hiển thị chi tiết đơn đặt tour vừa chọn.
*   **Áp dụng Voucher:** Nhập mã voucher hoặc quy đổi VivuPoints sang mã giảm giá và trừ trực tiếp vào hóa đơn.
*   **Mã QR thanh toán động:** Quét mã QR chứa sẵn số tiền và cú pháp chuyển khoản tự động để thực hiện giao dịch nhanh qua ứng dụng ngân hàng.

### 6. Trang cá nhân (profile/profile.html)
*   **Hồ sơ cá nhân:** Cập nhật họ tên, số điện thoại và tải lên ảnh đại diện thời gian thực.
*   **Hạng thành viên & VivuPoints:** Hiển thị số điểm tích lũy thành viên, huy hiệu hạng Vàng, Bạc, Đồng và nút mở modal quy đổi điểm lấy Voucher.
*   **Lịch sử booking:** Theo dõi trạng thái đơn hàng (Đang xử lý, Đã thanh toán, Đã hoàn thành, Đã hủy).
*   **Hủy đơn / Hoàn thành:** Khách hàng có thể nhấn nút "Yêu cầu hủy" đối với tour chưa khởi hành, hoặc nhấn "Hoàn thành Tour" đối với chuyến đi đã hoàn tất để nhận thêm điểm thưởng.
*   **Đánh giá chuyến đi (Review):** Modal viết đánh giá, chọn số sao, nhận xét chi tiết và đính kèm tối đa 3 ảnh cùng 2 video thực tế từ thiết bị.

---

## Thiết kế và Giao diện tương thích (Responsive Design)

*   **Chủ đề thiết kế:** Sử dụng tông màu xanh lục bảo (Emerald Green) thân thiện, hệ thống đổ bóng sâu tạo khối và thiết kế kính mờ (Glassmorphism) mang lại giao diện cao cấp.
*   **Cơ chế Responsive:**
    *   **Desktop (>= 992px):** Hiển thị đầy đủ menu điều hướng mở rộng, thanh lọc tour cố định bên trái, lưới tour 3 - 4 cột.
    *   **Tablet (768px - 991px):** Menu chuyển thành nút mở rộng, bộ lọc tour chuyển thành nút Offcanvas trượt từ cạnh bên, lưới tour hiển thị 2 cột.
    *   **Mobile (< 768px):** Menu dọc ẩn/hiện, bộ lọc tour xếp ngang trên đầu trang danh sách, các chi tiết được sắp xếp dạng dọc 1 cột duy nhất thuận tiện cho thao tác chạm vuốt.

---

## Cấu trúc thư mục Frontend

```text
frontend/
├── assets/                 # Các tệp tài nguyên tĩnh của hệ thống
│   ├── images/                 # Hình ảnh banner, categories, điểm đến
│   │   ├── avt/                    # Thư mục lưu trữ ảnh đại diện người dùng tải lên
│   │   └── reviews/                # Thư mục lưu trữ ảnh đánh giá tour người dùng tải lên
│   └── videos/                 # Các video giới thiệu điểm đến
│
├── booking/                # Module đặt chỗ và thanh toán
│   ├── booking.html            # Trang điền thông tin đặt tour
│   ├── payment.html            # Trang thanh toán và quét mã QR
│   ├── success.html            # Trang báo thanh toán thành công
│   ├── failed.html             # Trang báo thanh toán thất bại
│   └── script.js               # Logic điều phối đặt chỗ, tính tiền, sinh mã QR
│
├── css/                    # Thiết kế kiểu dáng hệ thống
│   └── style.css               # Hệ thống Token màu sắc, Navbar, Footer toàn cục
│
├── js/                     # Các mã nguồn tiện ích dùng chung toàn trang
│   ├── auth.js                 # Kiểm tra đăng nhập, lưu JWT token, đăng xuất
│   ├── search.js               # Logic điều khiển Autocomplete ô tìm kiếm trên Navbar
│   ├── chatbox.js              # Khung chat hỗ trợ khách hàng tự động
│   └── weather.js              # Logic lấy thời tiết hiện tại (nếu có)
│
├── login/                  # Module đăng nhập tài khoản
│   ├── login.html
│   └── style.css
│
├── profile/                # Module trang cá nhân người dùng
│   ├── profile.html            # Trang cá nhân, lịch sử đặt, viết đánh giá
│   ├── style.css
│   └── script.js               # Logic lấy thông tin, đổi điểm, upload avatar, review
│
├── register/               # Module đăng ký tài khoản mới
│   ├── register.html
│   └── style.css
│
├── tour-detail/            # Module chi tiết tour du lịch
│   ├── tour-detail.html        # Trang chi tiết, Virtual Tour 360, Google Maps
│   ├── style.css
│   └── script.js               # Logic tải dữ liệu chi tiết tour theo ID
│
├── tours/                  # Module danh sách tour và bộ lọc
│   ├── tours.html              # Trang danh sách tour và bộ lọc bên trái
│   ├── style.css
│   └── script.js               # Logic tìm kiếm, lọc tức thì và sắp xếp tour
│
└── index.html              # Trang chủ hệ thống VivuViet
```

---

## Hướng dẫn khởi chạy giao diện

Do Frontend được xây dựng hoàn toàn từ các file tĩnh HTML, CSS, JS gốc (không sử dụng bundler hay build tool), bạn có hai cách để khởi chạy giao diện:

### Cách 1: Chạy đồng bộ qua máy chủ Backend (Khuyên dùng)
Máy chủ NodeJS Backend đã được thiết lập tự động phục vụ tĩnh (Static Serve) thư mục `frontend`. 
1.  Khởi chạy Backend (trong thư mục `backend` chạy `npm run dev`).
2.  Mở trình duyệt và truy cập: **`http://localhost:5000`** để sử dụng website.

### Cách 2: Khởi chạy độc lập bằng Live Server
Nếu muốn phát triển hoặc kiểm tra độc lập phần Frontend:
1.  Sử dụng tiện ích mở rộng **Live Server** (ví dụ trên VS Code) để khởi chạy thư mục `frontend`.
2.  Mở địa chỉ chạy độc lập (thường là `http://127.0.0.1:5500` hoặc `http://localhost:3000`).
3.  Phần Frontend đã được lập trình sẵn tự động chuyển tiếp API chéo nguồn (CORS) tới cổng Backend chạy song song ở cổng `5000`.
