// booking/script.js - Logic chung cho quy trình đặt tour và thanh toán

let tourId = "";
let bookingData = {};
let tourDetails = null;
let selectedMethod = "bank_transfer";

// Lưu trữ các phần tử giao diện (DOM elements)
const els = {
    summaryTourContent: document.getElementById("summary-tour-content"),
    summaryPriceBreakdown: document.getElementById("summary-price-breakdown"),
    passengersContainer: document.getElementById("passengers-container"),
    btnApplyVoucher: document.getElementById("btnApplyVoucher"),
    voucherCodeInput: document.getElementById("voucherCodeInput"),
    voucherMessage: document.getElementById("voucher-message"),
    splitBillCheck: document.getElementById("splitBillCheck"),
    splitPreviewCard: document.getElementById("split-preview-card"),
    splitPreviewBody: document.getElementById("split-preview-body"),
    splitBillView: document.getElementById("split-bill-view"),
    splitBillList: document.getElementById("split-bill-list"),
    bankRef: document.getElementById("bank-ref"),
};

// Điểm vào - xác định trang hiện tại và khởi chạy
document.addEventListener("authReady", async () => {
    // Lấy tourId từ đường dẫn URL
    const pathParts = window.location.pathname.split("/");

    // Tìm vị trí của 'booking' trong đường dẫn
    const bookingIdx = pathParts.indexOf("booking");
    if (bookingIdx !== -1 && pathParts[bookingIdx + 1]) {
        tourId = pathParts[bookingIdx + 1];
        // Bỏ qua các giá trị không phải tourId thật
        if (["payment", "success", "failed"].includes(tourId)) {
            tourId = "";
        }
    }

    // Xác định đang ở trang thanh toán hay trang nhập thông tin
    const isPaymentPage = window.location.pathname.includes("/payment");

    // Kiểm tra người dùng đã đăng nhập chưa
    const token = localStorage.getItem("token");
    if (!token) {
        showToast("Bạn cần đăng nhập tài khoản để đặt tour!", "error");
        setTimeout(() => (window.location.href = "/login"), 1200);
        return;
    }

    if (isPaymentPage) {
        initPaymentPage();
    } else {
        initBookingDetailsPage();
    }

    // Hiển thị nội dung trang (tắt màn hình loading)
    document.body.classList.remove("page-loading");
    document.body.classList.add("page-ready");
});

// Bước 1: nhập thông tin hành khách
async function initBookingDetailsPage() {
    const query = new URLSearchParams(window.location.search);
    const date = query.get("date") || new Date().toISOString().split("T")[0];
    const adults = Number(query.get("adults")) || 1;
    const children = Number(query.get("children")) || 0;
    const totalQty = adults + children;

    // Khởi tạo bộ nhớ tạm cho thông tin đặt tour
    bookingData = {
        tour_id: tourId,
        departure_date: date,
        adults_qty: adults,
        children_qty: children,
        quantity: totalQty,
        voucher_code: null,
        discount_amount: 0,
        is_split: false,
        passengers: [],
    };

    // Tự động điền thông tin liên hệ từ tài khoản hiện tại
    const user = window.currentUser ? window.currentUser() : null;
    if (user) {
        document.getElementById("contactName").value = user.fullname || "";
        document.getElementById("contactEmail").value = user.email || "";
        document.getElementById("contactPhone").value = user.phone || "";
    }

    // Lấy thông tin tour để hiển thị tóm tắt đơn hàng
    await fetchTourDetails();
    renderSummaryPanel();

    // Tạo các ô nhập liệu cho từng hành khách
    if (els.passengersContainer) {
        els.passengersContainer.innerHTML = "";

        // Render form cho người lớn
        for (let i = 0; i < adults; i++) {
            els.passengersContainer.innerHTML += `
        <div class="passenger-item">
          <div class="passenger-item-title"><i class="bi bi-person-fill text-primary"></i> Hành khách người lớn #${i + 1}</div>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fs-8 fw-bold">Họ và tên *</label>
              <input type="text" class="form-control py-2 shadow-none fs-7 adult-name" required placeholder="Ví dụ: Nguyễn Văn A">
            </div>
            <div class="col-md-6">
              <label class="form-label fs-8 fw-bold">Số CCCD / Hộ chiếu *</label>
              <input type="text" class="form-control py-2 shadow-none fs-7 adult-passport" required placeholder="CCCD hoặc số hộ chiếu">
            </div>
            <div class="col-md-6">
              <label class="form-label fs-8 fw-bold">Số điện thoại</label>
              <input type="tel" class="form-control py-2 shadow-none fs-7 adult-phone" placeholder="Số điện thoại liên hệ">
            </div>
          </div>
        </div>
      `;
        }

        // Render form cho trẻ em
        for (let i = 0; i < children; i++) {
            els.passengersContainer.innerHTML += `
        <div class="passenger-item">
          <div class="passenger-item-title"><i class="bi bi-emoji-smile-fill text-accent"></i> Hành khách trẻ em #${i + 1}</div>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fs-8 fw-bold">Họ và tên *</label>
              <input type="text" class="form-control py-2 shadow-none fs-7 child-name" required placeholder="Ví dụ: Nguyễn Văn B">
            </div>
            <div class="col-md-6">
              <label class="form-label fs-8 fw-bold">Số hộ chiếu / CCCD (nếu có)</label>
              <input type="text" class="form-control py-2 shadow-none fs-7 child-passport" placeholder="Số định danh hoặc hộ chiếu">
            </div>
          </div>
        </div>
      `;
        }
    }

    // Cập nhật preview chia hóa đơn khi nhập tên
    const nameInputs = document.querySelectorAll(".adult-name, .child-name");
    nameInputs.forEach((input) => {
        input.addEventListener("input", () => {
            if (bookingData.is_split) toggleSplitBillPreview();
        });
    });

    // Kích hoạt ẩp mã giảm giá khi bấm nút
    if (els.btnApplyVoucher) {
        els.btnApplyVoucher.addEventListener("click", applyVoucher);
    }

    // Bật/tắt chế độ chia hóa đơn theo nhóm
    if (els.splitBillCheck) {
        els.splitBillCheck.addEventListener("change", (e) => {
            bookingData.is_split = e.target.checked;
            toggleSplitBillPreview();
        });
    }
}

async function fetchTourDetails() {
    try {
        const res = await fetch(`${API_URL}/tours/${tourId}`);
        if (res.ok) {
            tourDetails = await res.json();
        }
    } catch (error) {
        console.error("Fetch details error:", error);
    }
}

function renderSummaryPanel() {
    if (!els.summaryTourContent || !tourDetails) return;

    els.summaryTourContent.innerHTML = `
    <div class="d-flex gap-3 align-items-center">
      <img src="${tourDetails.image || "/assets/images/dulichbien.png"}" class="rounded-3" style="width: 70px; height: 70px; object-fit: cover;">
      <div>
        <div class="summary-tour-title">${tourDetails.title || tourDetails.name}</div>
        <div class="summary-tour-meta mb-0"><i class="bi bi-calendar3 text-accent me-1"></i> Khởi hành: ${new Date(bookingData.departure_date).toLocaleDateString("vi-VN")}</div>
        <div class="summary-tour-meta mb-0"><i class="bi bi-people-fill text-accent me-1"></i> Số lượng: ${bookingData.quantity} khách (${bookingData.adults_qty}NL, ${bookingData.children_qty}TE)</div>
      </div>
    </div>
  `;

    updatePriceSummary();

    // Gọi hiển thị Gợi ý Thời tiết và Hành trang
    if (
        tourDetails.locationCoords &&
        tourDetails.locationCoords.lat &&
        tourDetails.locationCoords.lng
    ) {
        // Đảm bảo hàm renderWeatherRecommendation từ weather.js đã sẵn sàng
        if (typeof renderWeatherRecommendation === "function") {
            renderWeatherRecommendation(
                "booking-weather-section",
                tourDetails.locationCoords.lat,
                tourDetails.locationCoords.lng,
                tourDetails.destination || tourDetails.weatherLocation,
                bookingData.departure_date,
            );
        }
    }
}

function updatePriceSummary() {
    if (!els.summaryPriceBreakdown || !tourDetails) return;

    const adultPrice = tourDetails.price || 3000000;
    const childPrice = tourDetails.childPrice || Math.round(adultPrice * 0.5);
    const feeRate = tourDetails.service_fee_rate || 10;

    const subtotal =
        bookingData.adults_qty * adultPrice +
        bookingData.children_qty * childPrice;
    const serviceFee = Math.round(subtotal * (feeRate / 100));
    const finalPrice = subtotal + serviceFee - bookingData.discount_amount;

    bookingData.subtotal = subtotal;
    bookingData.service_fee = serviceFee;
    bookingData.final_price = finalPrice;

    els.summaryPriceBreakdown.innerHTML = `
    <div class="price-breakdown-row">
      <span>Người lớn (${bookingData.adults_qty} x ${adultPrice.toLocaleString("vi-VN")} đ)</span>
      <span>${(bookingData.adults_qty * adultPrice).toLocaleString("vi-VN")} đ</span>
    </div>
    ${
        bookingData.children_qty > 0
            ? `
      <div class="price-breakdown-row">
        <span>Trẻ em (${bookingData.children_qty} x ${childPrice.toLocaleString("vi-VN")} đ)</span>
        <span>${(bookingData.children_qty * childPrice).toLocaleString("vi-VN")} đ</span>
      </div>
    `
            : ""
    }
    <div class="price-breakdown-row">
      <span>Thuế & Phí dịch vụ (${feeRate}%)</span>
      <span>${serviceFee.toLocaleString("vi-VN")} đ</span>
    </div>
    ${
        bookingData.discount_amount > 0
            ? `
      <div class="price-breakdown-row text-success fw-bold">
        <span>Voucher giảm giá</span>
        <span>-${bookingData.discount_amount.toLocaleString("vi-VN")} đ</span>
      </div>
    `
            : ""
    }
    <div class="price-breakdown-row border-top border-light pt-2 fw-bold text-dark fs-6">
      <span>Thành tiền</span>
      <span class="text-accent fs-5">${finalPrice.toLocaleString("vi-VN")} đ</span>
    </div>
  `;
}

async function applyVoucher() {
    const code = els.voucherCodeInput.value.trim().toUpperCase();
    if (!code) {
        showToast("Vui lòng nhập mã giảm giá!", "error");
        return;
    }

    els.btnApplyVoucher.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    els.btnApplyVoucher.disabled = true;

    try {
        const res = await fetch(`${API_URL}/vouchers/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (res.ok) {
            bookingData.voucher_code = data.code;
            bookingData.discount_amount = data.discount_amount;

            els.voucherMessage.className = "text-success fw-semibold mt-1";
            els.voucherMessage.innerText = `Áp dụng thành công! Được giảm ${data.discount_amount.toLocaleString("vi-VN")} đ`;

            updatePriceSummary();
            showToast("Áp dụng mã thành công!", "success");
        } else {
            els.voucherMessage.className = "text-danger fw-semibold mt-1";
            els.voucherMessage.innerText =
                data.message || "Mã giảm giá không chính xác!";
            bookingData.voucher_code = null;
            bookingData.discount_amount = 0;
            updatePriceSummary();
        }
    } catch (error) {
        console.error("Validate voucher error:", error);
        showToast("Lỗi kết nối đến máy chủ!", "error");
    } finally {
        els.btnApplyVoucher.innerHTML = "Áp dụng";
        els.btnApplyVoucher.disabled = false;
    }
}

function toggleSplitBillPreview() {
    if (!els.splitPreviewCard || !els.splitPreviewBody || !tourDetails) return;

    if (!bookingData.is_split) {
        els.splitPreviewCard.style.display = "none";
        return;
    }

    els.splitPreviewCard.style.display = "block";

    // Tính toán chi phí cho từng người theo tỷ lệ
    const adultBasePrice = tourDetails.price || 3000000;
    const childBasePrice =
        tourDetails.childPrice || Math.round(adultBasePrice * 0.5);
    const subtotal = bookingData.subtotal;

    let adultPct = 0;
    let childPct = 0;
    let adultCost = 0;
    let childCost = 0;

    if (subtotal > 0) {
        adultPct = (adultBasePrice / subtotal) * 100;
        childPct = (childBasePrice / subtotal) * 100;
        adultCost = Math.round(
            (adultBasePrice / subtotal) * bookingData.final_price,
        );
        childCost = Math.round(
            (childBasePrice / subtotal) * bookingData.final_price,
        );
    }

    els.splitPreviewBody.innerHTML = "";

    // Lấy tên hành khách từ form
    const adultNames = document.querySelectorAll(".adult-name");
    for (let i = 0; i < bookingData.adults_qty; i++) {
        const pName =
            (adultNames[i] && adultNames[i].value.trim()) ||
            `Người lớn #${i + 1}`;
        const feeDiff = adultCost - adultBasePrice;
        const feeText =
            feeDiff >= 0
                ? `+ ${feeDiff.toLocaleString("vi-VN")} đ (Phụ phí/Thuế)`
                : `- ${Math.abs(feeDiff).toLocaleString("vi-VN")} đ (Giảm giá)`;

        els.splitPreviewBody.innerHTML += `
      <tr>
        <td>${pName}</td>
        <td>
          <div class="fs-8 text-secondary">Giá gốc: ${adultBasePrice.toLocaleString("vi-VN")} đ</div>
          <div class="fs-9 ${feeDiff >= 0 ? "text-muted" : "text-success"}">${feeText}</div>
        </td>
        <td class="fw-bold text-accent align-middle">${adultCost.toLocaleString("vi-VN")} đ</td>
      </tr>
    `;
    }

    const childNames = document.querySelectorAll(".child-name");
    for (let i = 0; i < bookingData.children_qty; i++) {
        const pName =
            (childNames[i] && childNames[i].value.trim()) || `Trẻ em #${i + 1}`;
        const feeDiff = childCost - childBasePrice;
        const feeText =
            feeDiff >= 0
                ? `+ ${feeDiff.toLocaleString("vi-VN")} đ (Phụ phí/Thuế)`
                : `- ${Math.abs(feeDiff).toLocaleString("vi-VN")} đ (Giảm giá)`;

        els.splitPreviewBody.innerHTML += `
      <tr>
        <td>${pName}</td>
        <td>
          <div class="fs-8 text-secondary">Giá gốc: ${childBasePrice.toLocaleString("vi-VN")} đ</div>
          <div class="fs-9 ${feeDiff >= 0 ? "text-muted" : "text-success"}">${feeText}</div>
        </td>
        <td class="fw-bold text-accent align-middle">${childCost.toLocaleString("vi-VN")} đ</td>
      </tr>
    `;
    }
}

function submitBookingDetails() {
    // Tổng hợp danh sách hành khách từ form
    const passengers = [];
    const adultNames = document.querySelectorAll(".adult-name");
    const adultPassports = document.querySelectorAll(".adult-passport");
    const adultPhones = document.querySelectorAll(".adult-phone");

    for (let i = 0; i < bookingData.adults_qty; i++) {
        passengers.push({
            fullname: adultNames[i].value.trim(),
            passport_cccd: adultPassports[i].value.trim(),
            phone: adultPhones[i] ? adultPhones[i].value.trim() : "",
            type: "adult",
        });
    }

    const childNames = document.querySelectorAll(".child-name");
    const childPassports = document.querySelectorAll(".child-passport");

    for (let i = 0; i < bookingData.children_qty; i++) {
        passengers.push({
            fullname: childNames[i].value.trim(),
            passport_cccd: childPassports[i]
                ? childPassports[i].value.trim()
                : "",
            type: "child",
        });
    }

    bookingData.passengers = passengers;

    // Xây dựng mảng chia hóa đơn nếu đã chọn tính năng này
    if (bookingData.is_split && tourDetails) {
        const adultBasePrice = tourDetails.price || 3000000;
        const childBasePrice =
            tourDetails.childPrice || Math.round(adultBasePrice * 0.5);
        const subtotal = bookingData.subtotal;
        let adultCost = Math.round(
            (adultBasePrice / subtotal) * bookingData.final_price,
        );
        let childCost = Math.round(
            (childBasePrice / subtotal) * bookingData.final_price,
        );

        bookingData.bill_split = passengers.map((p) => ({
            name: p.fullname,
            amount: p.type === "adult" ? adultCost : childCost,
        }));
    } else {
        bookingData.bill_split = [];
    }

    // Lưu dữ liệu vào bộ nhớ tạm rồi chuyển sang bước 2
    localStorage.setItem("temp_booking_data", JSON.stringify(bookingData));
    window.location.href = `/booking/${tourId}/payment`;
}

// Bước 2: xác nhận đơn hàng và chọn phương thức thanh toán
async function initPaymentPage() {
    // Lấy dữ liệu từ bộ nhớ tạm
    const cached = localStorage.getItem("temp_booking_data");
    if (!cached) {
        showToast("Vui lòng hoàn tất thông tin liên hệ trước!", "error");
        setTimeout(() => (window.location.href = `/booking/${tourId}`), 1000);
        return;
    }

    bookingData = JSON.parse(cached);

    // Tạo mã tham chiếu giao dịch giả lập
    if (els.bankRef) {
        els.bankRef.innerText = `VIVUVIET BK ${tourId.substring(0, 6).toUpperCase()}`;
    }

    await fetchTourDetails();

    // Hiển thị tóm tắt đơn hàng
    renderSummaryPanel();

    // Hiển thị bảng chia hóa đơn nếu đã chọn
    if (bookingData.is_split && els.splitBillView && els.splitBillList) {
        els.splitBillView.style.display = "block";
        els.splitBillList.innerHTML = bookingData.bill_split
            .map(
                (item) => `
      <div class="d-flex justify-content-between text-secondary">
        <span>${item.name}</span>
        <span class="fw-bold text-accent">${item.amount.toLocaleString("vi-VN")} đ</span>
      </div>
    `,
            )
            .join("");
    }
}

window.selectPaymentMethod = (card) => {
    const method = card.getAttribute("data-method");
    if (method === "momo" || method === "card") {
        showToast(
            "Hệ thống đang bảo trì phương thức thanh toán này!",
            "warning",
        );
        return;
    }

    // Bỏ active khỏi tất cả các card
    document
        .querySelectorAll(".payment-card")
        .forEach((c) => c.classList.remove("active"));

    // Đánh dấu card được chọn
    card.classList.add("active");
    selectedMethod = method;

    // Hiển thị chi tiết QR chỉ khi chọn chuyển khoản
    const qrBox = document.getElementById("bank-transfer-details");
    if (qrBox) {
        qrBox.style.display =
            selectedMethod === "bank_transfer" ? "block" : "none";
    }
};

async function executePayment() {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Hiển thị overlay đang xử lý thanh toán
    const loadingOverlay = document.createElement("div");
    loadingOverlay.className =
        "position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-90";
    loadingOverlay.style.zIndex = 9999;
    loadingOverlay.innerHTML = `
    <div class="spinner-border text-success mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
    <div class="fw-bold fs-6 text-primary text-center">Đang xử lý kết nối bảo mật đến cổng thanh toán ${selectedMethod.toUpperCase()}...</div>
  `;
    document.body.appendChild(loadingOverlay);

    try {
        // Gửi đơn đặt tour lên API backend
        const res = await fetch(`${API_URL}/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                tour_id: bookingData.tour_id,
                departure_date: bookingData.departure_date,
                quantity: bookingData.quantity,
                passengers: bookingData.passengers,
                voucher_code: bookingData.voucher_code,
                payment_method: selectedMethod,
                bill_split: bookingData.bill_split,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            // Giả lập redirect cổng thanh toán sau 2 giây
            setTimeout(async () => {
                loadingOverlay.remove();

                // Lưu thông tin đơn hàng thành công vào bộ nhớ tạm cho trang receipt
                const successPayload = {
                    _id: data.booking._id,
                    tour_name: tourDetails.title || tourDetails.name,
                    tour_image: tourDetails.image || "",
                    tour_duration: tourDetails.duration || "2N1Đ",
                    departure_date: bookingData.departure_date,
                    quantity: bookingData.quantity,
                    adults_qty: bookingData.adults_qty || 1,
                    children_qty: bookingData.children_qty || 0,
                    final_price: bookingData.final_price,
                };
                localStorage.setItem(
                    "last_booking_success",
                    JSON.stringify(successPayload),
                );

                // Xóa dữ liệu đơn hàng tạm thời
                localStorage.removeItem("temp_booking_data");
                localStorage.removeItem("last_booking_tour_id");

                if (selectedMethod === "vnpay") {
                    try {
                        const vnpayRes = await fetch(
                            `${API_URL}/payment/create`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    booking_id: data.booking._id,
                                }),
                            },
                        );
                        const vnpayData = await vnpayRes.json();
                        if (vnpayRes.ok && vnpayData.paymentUrl) {
                            window.location.href = vnpayData.paymentUrl;
                            return;
                        } else {
                            showToast(
                                "Lỗi khởi tạo cổng thanh toán VNPAY!",
                                "error",
                            );
                            setTimeout(
                                () =>
                                    (window.location.href = "/booking/failed"),
                                1000,
                            );
                            return;
                        }
                    } catch (err) {
                        console.error("VNPAY init error:", err);
                        showToast("Không thể kết nối đến VNPAY!", "error");
                        setTimeout(
                            () => (window.location.href = "/booking/failed"),
                            1000,
                        );
                        return;
                    }
                }

                window.location.href = "/booking/success";
            }, 2000);
        } else {
            setTimeout(() => {
                loadingOverlay.remove();
                showToast(
                    data.message || "Giao dịch thanh toán thất bại!",
                    "error",
                );

                // Lưu tourId để trang thất bại có thể thử lại
                localStorage.setItem(
                    "last_booking_tour_id",
                    bookingData.tour_id,
                );

                window.location.href = "/booking/failed";
            }, 1500);
        }
    } catch (error) {
        console.error("Execute payment error:", error);
        loadingOverlay.remove();
        showToast("Lỗi kết nối máy chủ thanh toán!", "error");
        window.location.href = "/booking/failed";
    }
}
