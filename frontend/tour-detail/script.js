// tour-detail/script.js - Logic điều khiển trang chi tiết tour

const els = {
    loading: document.getElementById("vv-loading-screen"),
    error: document.getElementById("vv-error-screen"),
    errorMessage: document.getElementById("vv-error-message"),
    content: document.getElementById("vv-tour-content"),
    gallery: document.getElementById("vv-gallery"),
    badges: document.getElementById("vv-badges"),
    title: document.getElementById("vv-title"),
    meta: document.getElementById("vv-meta"),
    highlightsSection: document.getElementById("vv-highlights-section"),
    itinerary: document.getElementById("vv-itinerary"),
    virtual360Section: document.getElementById("vv-virtual360-section"),
    map: document.getElementById("vv-map"),
    weatherSection: document.getElementById("vv-weather-section"),
    includeExcludeSection: document.getElementById(
        "vv-include-exclude-section",
    ),
    reviews: document.getElementById("vv-reviews"),
    sidebarContainer: document.getElementById("vv-sidebar-container"),
    relatedSection: document.getElementById("vv-related-section"),
    navSearchInput: document.getElementById("navSearchInput"),
};

let currentTour = null;

// Bảng mã thời tiết WMO sang mô tả tiếng Việt
const weatherMap = {
    0: { text: "Trời quang mây tạnh", icon: "bi-sun-fill" },
    1: { text: "Ít mây, trời nắng", icon: "bi-cloud-sun-fill" },
    2: { text: "Mây rải rác", icon: "bi-cloud-sun-fill" },
    3: { text: "Nhiều mây", icon: "bi-cloud-fill" },
    45: { text: "Sương mù", icon: "bi-cloud-fog2-fill" },
    48: { text: "Sương muối", icon: "bi-cloud-snow-fill" },
    51: { text: "Mưa phùn nhẹ", icon: "bi-cloud-drizzle-fill" },
    53: { text: "Mưa phùn vừa", icon: "bi-cloud-drizzle-fill" },
    55: { text: "Mưa phùn lớn", icon: "bi-cloud-drizzle-fill" },
    61: { text: "Mưa nhỏ rải rác", icon: "bi-cloud-rain-fill" },
    63: { text: "Mưa vừa", icon: "bi-cloud-rain-heavy-fill" },
    65: { text: "Mưa lớn kéo dài", icon: "bi-cloud-rain-heavy-fill" },
    80: { text: "Mưa rào nhẹ", icon: "bi-cloud-rain-fill" },
    81: { text: "Mưa rào vừa", icon: "bi-cloud-rain-heavy-fill" },
    82: { text: "Mưa rào rất lớn", icon: "bi-cloud-rain-heavy-fill" },
    95: { text: "Giông bão kèm sấm sét", icon: "bi-cloud-lightning-rain-fill" },
};

const getForecastDayLabel = (offset) => {
    if (offset === 0) return "Hôm nay";
    if (offset === 1) return "Ngày mai";
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `Thứ ${date.getDay() === 0 ? "CN" : date.getDay() + 1}`;
};

// Điểm vào khởi chạy trang chi tiết tour
async function loadTourDetail() {
    try {
        // Lấy slug hoặc ID từ đường dẫn URL (vd: /tours/kham-pha-sapa)
        const slugOrId = window.location.pathname.split("/").pop();
        if (!slugOrId || slugOrId === "tours") {
            showErrorState("Đường dẫn tour không hợp lệ!");
            return;
        }

        const res = await fetch(`${API_URL}/tours/${slugOrId}`);
        if (!res.ok) {
            if (res.status === 404)
                throw new Error(
                    "Không tìm thấy tour du lịch này trong hệ thống!",
                );
            throw new Error("Lỗi máy chủ du lịch!");
        }

        currentTour = await res.json();
        renderTourData(currentTour);
        loadRelatedTours(currentTour);

        // Chuyển màn hình từ loading sang nội dung chính
        els.loading.style.display = "none";
        els.error.style.display = "none";
        els.content.style.display = "block";

        document.body.classList.remove("page-loading");
        document.body.classList.add("page-ready");
    } catch (error) {
        console.error("Load tour detail error:", error);
        showErrorState(error.message);
    }
}

function showErrorState(message) {
    els.loading.style.display = "none";
    els.content.style.display = "none";
    els.error.style.display = "flex";
    els.errorMessage.innerText = message;

    document.body.classList.remove("page-loading");
    document.body.classList.add("page-ready");
}

// Đổ dữ liệu tour lên giao diện
function renderTourData(tour) {
    // Tiêu đề tab trình duyệt
    document.title = `${tour.title || tour.name} - VivuViet`;

    // Ảnh thư viện (gallery)
    const rawImgs = (tour.gallery && tour.gallery.length > 0)
        ? tour.gallery
        : (tour.images && tour.images.length > 0)
            ? tour.images
            : [tour.image];

    // Đảm bảo đủ 4 ảnh hiển thị phong phú trong lưới gallery
    const fallbackPool = [
        tour.image,
        "/assets/images/honthom.jpg",
        "/assets/images/safari.jpg",
        "/assets/images/kayak.jpg",
        "/assets/images/denlong.jpg",
        "/assets/images/dinh.jpg",
        "/assets/images/vungcao.png"
    ].filter(Boolean);

    const imgs = [];
    for (let i = 0; i < 4; i++) {
        imgs[i] = rawImgs[i] || fallbackPool[i] || tour.image;
    }

    els.gallery.innerHTML = `
    <div class="vv-gallery">
      <div class="vv-gallery-main">
        <img src="${imgs[0] || "/assets/images/dulichbien.png"}" alt="${tour.title || tour.name}">
      </div>
      <div class="vv-gallery-side">
        <img src="${imgs[1] || "/assets/images/dulichbien.png"}" alt="Scenic Image 2">
        <img src="${imgs[2] || "/assets/images/dulichbien.png"}" alt="Scenic Image 3">
        <div class="vv-gallery-wide">
          <img src="${imgs[3] || "/assets/images/dulichbien.png"}" alt="Scenic Image 4">
        </div>
      </div>
    </div>
  `;

    // Huy hiệu nổi bật / khuyến mãi
    let badgeHTML = "";
    if (tour.isFeatured)
        badgeHTML += `<span class="vv-badge vv-badge-best">Bán chạy</span>`;
    if (tour.discount)
        badgeHTML += `<span class="vv-badge vv-badge-save">Tiết kiệm -${tour.discount}%</span>`;
    els.badges.innerHTML = badgeHTML;

    // Tiêu đề và thông tin cơ bản của tour
    els.title.innerText = tour.title || tour.name;
    els.meta.innerHTML = `
    <span><i class="bi bi-star-fill vv-star"></i> <strong>${tour.rating ? tour.rating.toFixed(1) : "5.0"}</strong> (${tour.reviewCount || 0} đánh giá)</span>
    <span><i class="bi bi-clock-fill text-primary"></i> ${tour.duration}</span>
    <span><i class="bi bi-geo-alt-fill text-primary"></i> ${tour.destination}</span>
  `;

    // Các điểm nổi bật của chuyến đi
    if (tour.highlights && tour.highlights.length > 0) {
        els.highlightsSection.style.display = "block";
        els.highlightsSection.innerHTML = `
      <div class="vv-highlight-box">
        <h3>Điểm nổi bật hành trình</h3>
        <div class="vv-highlight-grid">
          ${tour.highlights
              .map(
                  (h) => `
            <div class="vv-highlight-item">
              <i class="bi bi-check-circle-fill"></i>
              <span>${h}</span>
            </div>
          `,
              )
              .join("")}
        </div>
      </div>
    `;
    } else {
        els.highlightsSection.style.display = "none";
    }

    // Lịch trình theo từng ngày
    if (tour.itinerary && tour.itinerary.length > 0) {
        els.itinerary.className = "accordion accordion-flush mt-4";
        els.itinerary.innerHTML = tour.itinerary
            .map(
                (day, idx) => `
      <div class="accordion-item border mb-3 bg-white rounded-3 overflow-hidden shadow-sm">
        <h2 class="accordion-header" id="headingDay${idx}">
          <button class="accordion-button fw-bold bg-white shadow-none border-0 vv-accordion-btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDay${idx}" aria-expanded="true" aria-controls="collapseDay${idx}">
            <span class="me-3 badge bg-accent text-white px-3 py-2">Ngày ${day.day}</span> ${day.title.replace(/^Ng[àa]y\s+\d+\s*[:\-–]\s*/i, '')}
          </button>
        </h2>
        <div id="collapseDay${idx}" class="accordion-collapse collapse show" aria-labelledby="headingDay${idx}">
          <div class="accordion-body text-secondary bg-light border-top">
            <p class="mb-0" style="line-height: 1.6;">${day.content.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      </div>
    `,
            )
            .join("");
    } else {
        els.itinerary.innerHTML =
            '<p class="text-muted">Chi tiết lịch trình đang được cập nhật...</p>';
    }

    // Khung xem 360° Google Street View
    if (
        tour.locationCoords &&
        tour.locationCoords.lat &&
        tour.locationCoords.lng
    ) {
        
        let vrLat = tour.locationCoords.lat;
        let vrLng = tour.locationCoords.lng;
        let showVR = true;
        
        // Ghi đè toạ độ chuẩn cho một số địa điểm nổi tiếng (chọn góc 360 độ đẹp nhất)
        const destLower = (tour.destination || "").toLowerCase() + " " + (tour.title || "").toLowerCase();
        
        if (destLower.includes("phú quốc") || destLower.includes("kiên giang")) {
            vrLat = 10.0125; vrLng = 104.0163; // Sun World Hòn Thơm
        } else if (destLower.includes("sapa") || destLower.includes("lào cai") || destLower.includes("fansipan") || destLower.includes("sa pa")) {
            vrLat = 22.3033; vrLng = 103.7750; // Đỉnh Fansipan (Toạ độ chuẩn đã xác minh hoạt động)
        } else if (destLower.includes("nha trang") || destLower.includes("khánh hòa")) {
            vrLat = 12.2227; vrLng = 109.2396; // VinWonders Nha Trang
        } else if (destLower.includes("an giang") || destLower.includes("châu đốc")) {
            vrLat = 10.6726; vrLng = 105.0788; // Miếu Bà Chúa Xứ
        } else if (destLower.includes("hạ long") || destLower.includes("quảng ninh")) {
            vrLat = 20.9566; vrLng = 107.0505; // Cáp treo Nữ Hoàng
        } else if (destLower.includes("đà nẵng") || destLower.includes("bà nà")) {
            vrLat = 16.0610; vrLng = 108.2272; // Cầu Rồng Đà Nẵng (Điểm chắc chắn có VR đẹp)
        } else if (destLower.includes("đà lạt") || destLower.includes("lâm đồng")) {
            vrLat = 11.9388; vrLng = 108.4449; // Quảng trường Lâm Viên
        } else if (destLower.includes("cần thơ") || destLower.includes("cái răng")) {
            vrLat = 10.0039; vrLng = 105.7454; // Chợ Nổi Cái Răng (trên sông)
        } else if (destLower.includes("ninh bình") || destLower.includes("tràng an")) {
            vrLat = 20.2562; vrLng = 105.9181; // Bến thuyền Tràng An
        } else if (destLower.includes("hội an") || destLower.includes("quảng nam")) {
            vrLat = 15.8776; vrLng = 108.3283; // Chùa Cầu Hội An
        } else if (destLower.includes("cao bằng") || destLower.includes("bản giốc")) {
            vrLat = 22.8536; vrLng = 106.7241; // Thác Bản Giốc
        } else if (destLower.includes("huế") || destLower.includes("đại nội")) {
            vrLat = 16.4687; vrLng = 107.5768; // Ngọ Môn - Đại Nội Huế
        } else if (destLower.includes("vũng tàu")) {
            vrLat = 10.3270; vrLng = 107.0841; // Tượng Chúa Kitô Vua
        } else if (destLower.includes("cà mau") || destLower.includes("đất mũi")) {
            vrLat = 8.6231; vrLng = 104.7307; // Cột mốc Đất Mũi Cà Mau
        }
        
        // Tránh tình trạng tour tỉnh khác bị gán mặc định Hồ Hoàn Kiếm (Hà Nội)
        if (Math.abs(vrLat - 21.0285) < 0.1 && Math.abs(vrLng - 105.8542) < 0.1) {
            // Nếu toạ độ ở Hà Nội nhưng tên tour không có chữ Hà Nội
            if (!destLower.includes("hà nội") && !destLower.includes("hanoi")) {
                showVR = false; // Tạm ẩn thay vì hiển thị sai Hồ Hoàn Kiếm
            }
        }

        if (showVR) {
            els.virtual360Section.style.display = "block";
            const panoImg = tour.image || imgs[0] || "/assets/images/sanmay.png";
            const openInMapsUrl = `https://www.google.com/maps?q=${vrLat},${vrLng}&t=k`;

            els.virtual360Section.innerHTML = `
          <h2 class="vv-section-title">Trải nghiệm không gian 360° Cảnh Quan VR</h2>
          <p class="vv-360-note">Kéo rê chuột (hoặc vuốt màn hình) trên khung ảnh dưới đây để xoay ngắm toàn cảnh thiên nhiên 360°:</p>
          <div class="vv-360-panorama-container shadow-sm rounded-4 overflow-hidden position-relative" id="vv360Viewer">
            <div class="vv-360-panorama-img" id="vv360Img" style="background-image: url('${panoImg}');"></div>
            <div class="vv-360-badge"><i class="bi bi-vr me-1"></i> 360° Panorama VR Mode</div>
            <div class="vv-360-controls">
                <button type="button" class="btn btn-dark btn-sm rounded-pill opacity-90 px-3" onclick="rotate360(-80)"><i class="bi bi-arrow-left me-1"></i> Trái</button>
                <button type="button" class="btn btn-success btn-sm rounded-pill px-3 fw-bold" id="btnAutoRotate360" onclick="toggleAutoRotate360()"><i class="bi bi-arrow-repeat me-1"></i> Tự xoay 360°</button>
                <button type="button" class="btn btn-dark btn-sm rounded-pill opacity-90 px-3" onclick="rotate360(80)">Phải <i class="bi bi-arrow-right ms-1"></i></button>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
              <span class="fs-8 text-muted"><i class="bi bi-info-circle me-1"></i> Mẹo: Giữ chuột trái và di chuyển sang ngang để xoay ngắm toàn cảnh 360 độ</span>
              <a href="${openInMapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-success rounded-pill btn-sm fw-bold">
                <i class="bi bi-geo-alt-fill me-1"></i> Định vị điểm đến trên Google Maps
              </a>
          </div>
        `;

            setTimeout(init360DragViewer, 100);
        } else {
            els.virtual360Section.style.display = "none";
        }
    } else {
        els.virtual360Section.style.display = "none";
    }

    // Bản đồ lộ trình điểm đi - điểm đến
    const origin = encodeURIComponent(tour.departure || "Hà Nội");
    const dest = encodeURIComponent(tour.location || tour.destination || "Việt Nam");
    els.map.innerHTML = `
    <div style="position: relative; width: 100%; height: 350px; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm);">
      <iframe src="https://maps.google.com/maps?saddr=${origin}&daddr=${dest}&output=embed" 
        width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
    </div>
  `;

    // Fetch & Render Weather sẽ được xử lý khi khởi tạo sidebar và lắng nghe sự kiện đổi ngày

    // Dịch vụ bao gồm và chưa bao gồm
    const incList =
        tour.includes && tour.includes.length > 0
            ? tour.includes
            : [
                  "Xe di chuyển khứ hồi",
                  "Khách sạn lưu trú",
                  "Vé tham quan",
                  "Hướng dẫn viên",
              ];
    const excList =
        tour.excludes && tour.excludes.length > 0
            ? tour.excludes
            : [
                  "Thuế VAT",
                  "Chi phí cá nhân",
                  "Đồ uống gọi thêm",
                  "Tiền tip HDV",
              ];

    els.includeExcludeSection.innerHTML = `
    <div>
      <h3 class="vv-include-title vv-include-yes"><i class="bi bi-patch-check-fill me-2"></i>Dịch vụ bao gồm</h3>
      <ul class="vv-include-list">
        ${incList.map((item) => `<li><i class="bi bi-check2"></i> ${item}</li>`).join("")}
      </ul>
    </div>
    <div>
      <h3 class="vv-include-title vv-include-no"><i class="bi bi-patch-exclamation-fill me-2"></i>Chưa bao gồm</h3>
      <ul class="vv-include-list">
        ${excList.map((item) => `<li><i class="bi bi-x-lg"></i> ${item}</li>`).join("")}
      </ul>
    </div>
  `;

    // Đánh giá từ khách hàng
    if (tour.reviews && tour.reviews.length > 0) {
        els.reviews.innerHTML = tour.reviews
            .map((rev) => {
                // Dùng chữ viết tắt tên nếu không có avatar
                const reviewerName =
                    rev.user_id && rev.user_id.fullname
                        ? rev.user_id.fullname
                        : "Khách VivuViet";
                const initials = reviewerName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(-2)
                    .join("")
                    .toUpperCase();

                const starsHTML = Array.from({ length: 5 })
                    .map(
                        (_, i) =>
                            `<i class="bi ${i < (rev.rating || 5) ? "bi-star-fill text-warning" : "bi-star"}"></i>`,
                    )
                    .join("");

                return `
        <div class="vv-review-card">
          <div class="vv-review-avatar">${initials}</div>
          <div class="vv-review-body">
            <div class="vv-review-head">
              <div>
                <div class="vv-review-name">${reviewerName}</div>
                <div class="vv-review-date">${new Date(rev.createdAt).toLocaleDateString("vi-VN")}</div>
              </div>
              <div class="vv-review-stars">${starsHTML}</div>
            </div>
            <p class="vv-review-comment">"${rev.comment}"</p>
          </div>
        </div>
      `;
            })
            .join("");
    } else {
        els.reviews.innerHTML =
            '<p class="text-muted fst-italic">Hành trình này chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm!</p>';
    }

    // Thanh sidebar đặt tour và công cụ tính chi phí
    initBookingSidebar(tour);
}

// Thanh sidebar tính giá và đặt tour
function initBookingSidebar(tour) {
    if (!els.sidebarContainer) return;

    // Số lượng hành khách mặc định
    let adults = 1;
    let children = 0;
    const maxPax = tour.maxGroupSize || 10;

    const adultPrice = tour.price || 3000000;
    const childPrice = tour.childPrice || Math.round(adultPrice * 0.5); // Trẻ em được giảm 50% theo mặc định
    const feeRate = tour.service_fee_rate || 10; // Tỷ lệ thuế & phí dịch vụ (%)

    const renderSidebar = () => {
        const subtotal = adults * adultPrice + children * childPrice;
        const serviceFee = Math.round(subtotal * (feeRate / 100));
        const total = subtotal + serviceFee;

        els.sidebarContainer.innerHTML = `
      <div class="sidebar-booking-card shadow-sm">
        <div class="mb-4">
          <span class="sidebar-price-label">Giá mỗi người lớn từ</span>
          <div class="sidebar-price-value">${adultPrice.toLocaleString("vi-VN")} đ</div>
        </div>
        
        <form id="sidebarBookingForm" onsubmit="event.preventDefault(); proceedToBooking();">
          <!-- Departure Date -->
          <div class="mb-3">
            <label class="form-label fs-7 fw-bold text-primary">Ngày khởi hành dự kiến</label>
            <input type="date" id="bookDate" class="form-control py-2 shadow-none fs-7" required min="${new Date().toISOString().split("T")[0]}">
          </div>
          
          <!-- Adults Count -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div class="counter-label">Người lớn</div>
              <div class="counter-desc">Từ 12 tuổi trở lên</div>
            </div>
            <div class="counter-controls">
              <button type="button" class="btn-counter" onclick="changePax('adults', -1)" id="btnMinusAdult">-</button>
              <span class="fw-bold fs-6" id="adultCountVal">${adults}</span>
              <button type="button" class="btn-counter" onclick="changePax('adults', 1)" id="btnPlusAdult">+</button>
            </div>
          </div>

          <!-- Children Count -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div class="counter-label">Trẻ em</div>
              <div class="counter-desc">Từ 2 đến 11 tuổi (Giá: ${childPrice.toLocaleString("vi-VN")} đ)</div>
            </div>
            <div class="counter-controls">
              <button type="button" class="btn-counter" onclick="changePax('children', -1)" id="btnMinusChild">-</button>
              <span class="fw-bold fs-6" id="childCountVal">${children}</span>
              <button type="button" class="btn-counter" onclick="changePax('children', 1)" id="btnPlusChild">+</button>
            </div>
          </div>

          <!-- Calculator breakdown details -->
          <div class="price-breakdown border-top border-light pt-3 mb-4">
            <h6 class="fw-bold fs-7 mb-2 text-primary">Dự toán ngân sách</h6>
            <div class="price-breakdown-row">
              <span>Người lớn (${adults} x ${adultPrice.toLocaleString("vi-VN")} đ)</span>
              <span>${(adults * adultPrice).toLocaleString("vi-VN")} đ</span>
            </div>
            ${
                children > 0
                    ? `
              <div class="price-breakdown-row">
                <span>Trẻ em (${children} x ${childPrice.toLocaleString("vi-VN")} đ)</span>
                <span>${(children * childPrice).toLocaleString("vi-VN")} đ</span>
              </div>
            `
                    : ""
            }
            <div class="price-breakdown-row">
              <span>Thuế & Phí dịch vụ (${feeRate}%)</span>
              <span>${serviceFee.toLocaleString("vi-VN")} đ</span>
            </div>
            <div class="price-breakdown-row border-top border-light pt-2 fw-bold text-dark fs-6">
              <span>Tổng chi phí ước tính</span>
              <span class="text-accent">${total.toLocaleString("vi-VN")} đ</span>
            </div>
          </div>

          <button type="submit" class="btn-brand w-100 py-2.5 justify-content-center text-center">ĐẶT TOUR NGAY</button>
        </form>
      </div>
    `;

        // Đặt ngày mặc định là ngày mai
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const bookDateInput = document.getElementById("bookDate");
        if (bookDateInput) {
            if (!bookDateInput.hasAttribute("data-has-listener")) {
                bookDateInput.value = tomorrow.toISOString().split("T")[0];
                bookDateInput.setAttribute("data-has-listener", "true");

                // Gọi API lần đầu
                if (
                    tour.locationCoords &&
                    tour.locationCoords.lat &&
                    tour.locationCoords.lng
                ) {
                    renderWeatherRecommendation(
                        "vv-weather-section",
                        tour.locationCoords.lat,
                        tour.locationCoords.lng,
                        tour.location || tour.destination || tour.weatherLocation,
                        bookDateInput.value,
                    );
                }

                // Lắng nghe đổi ngày
                bookDateInput.addEventListener("change", (e) => {
                    if (
                        tour.locationCoords &&
                        tour.locationCoords.lat &&
                        tour.locationCoords.lng
                    ) {
                        renderWeatherRecommendation(
                            "vv-weather-section",
                            tour.locationCoords.lat,
                            tour.locationCoords.lng,
                            tour.location || tour.destination || tour.weatherLocation,
                            e.target.value,
                        );
                    }
                });
            }
        }
    };

    window.changePax = (type, val) => {
        const totalCurrent = adults + children;
        if (type === "adults") {
            const newAdults = adults + val;
            if (newAdults >= 1 && newAdults + children <= maxPax) {
                adults = newAdults;
            }
        } else {
            const newChildren = children + val;
            if (newChildren >= 0 && adults + newChildren <= maxPax) {
                children = newChildren;
            }
        }
        renderSidebar();
    };

    window.proceedToBooking = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            showToast(
                "Vui lòng đăng nhập tài khoản trước khi đặt tour!",
                "error",
            );
            // Chuyển sang trang đặt tour sau khi kiểm tra đăng nhập
            window.location.href = `/login`;
            return;
        }

        const date = document.getElementById("bookDate").value;
        window.location.href = `/booking/${tour._id}?date=${date}&adults=${adults}&children=${children}`;
    };

    renderSidebar();
}

// Hiển thị các tour liên quan
async function loadRelatedTours(tour) {
    if (!els.relatedSection) return;

    try {
        const res = await fetch(
            `${API_URL}/tours?limit=3&category=${encodeURIComponent(tour.category)}`,
        );
        if (!res.ok) throw new Error("Api failed");
        const data = await res.json();
        const list = (data.tours || [])
            .filter((t) => t._id !== tour._id)
            .slice(0, 3);

        if (list.length === 0) {
            els.relatedSection.innerHTML = "";
            return;
        }

        els.relatedSection.innerHTML = `
      <h3 class="vv-section-title mb-4">Các hành trình liên quan</h3>
      <div class="row g-4">
        ${list
            .map(
                (t) => `
          <div class="col-md-6 col-lg-4">
            <div class="tour-card" onclick="window.location.href='/tours/${t.slug || t._id}'">
              <div class="tour-card-img-wrap">
                <img src="${t.image || "/assets/images/dulichbien.png"}" alt="${t.title || t.name}">
              </div>
              <div class="tour-card-body">
                <div class="tour-card-meta">
                  <span><i class="bi bi-clock-fill text-primary"></i> ${t.duration}</span>
                  <span><i class="bi bi-geo-alt-fill text-primary"></i> ${t.destination}</span>
                </div>
                <h5 class="tour-card-title line-clamp-2">${t.title || t.name}</h5>
              </div>
              <div class="tour-card-footer">
                <div>
                  <span class="tour-card-price-label">Giá từ</span>
                  <span class="tour-card-price">${t.price.toLocaleString("vi-VN")} đ</span>
                </div>
                <span class="btn-brand fs-7 py-1 px-3">Chi tiết</span>
              </div>
            </div>
          </div>
        `,
            )
            .join("")}
      </div>
    `;
    } catch (error) {
        console.error("Load related tours error:", error);
        els.relatedSection.innerHTML = "";
    }
}

// Khởi động khi auth sẵn sàng
document.addEventListener("authReady", () => {
    loadTourDetail();
});

// 360 Panorama VR Drag & Rotate Logic
let isDragging360 = false;
let startX360 = 0;
let currentPos360 = 50;
let autoRotateInterval = null;

window.rotate360 = (delta) => {
    currentPos360 += delta * 0.1;
    const imgEl = document.getElementById("vv360Img");
    if (imgEl) imgEl.style.backgroundPosition = `${currentPos360}% center`;
};

window.toggleAutoRotate360 = () => {
    const btn = document.getElementById("btnAutoRotate360");
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
        if (btn) btn.innerHTML = `<i class="bi bi-arrow-repeat me-1"></i> Tự xoay 360°`;
    } else {
        autoRotateInterval = setInterval(() => {
            rotate360(1.5);
        }, 30);
        if (btn) btn.innerHTML = `<i class="bi bi-pause-fill me-1"></i> Tạm dừng`;
    }
};

function init360DragViewer() {
    const viewer = document.getElementById("vv360Viewer");
    const imgEl = document.getElementById("vv360Img");
    if (!viewer || !imgEl) return;

    viewer.addEventListener("mousedown", (e) => {
        isDragging360 = true;
        startX360 = e.clientX;
    });

    window.addEventListener("mouseup", () => {
        isDragging360 = false;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging360) return;
        const deltaX = e.clientX - startX360;
        startX360 = e.clientX;
        currentPos360 += deltaX * 0.15;
        imgEl.style.backgroundPosition = `${currentPos360}% center`;
    });

    viewer.addEventListener("touchstart", (e) => {
        isDragging360 = true;
        startX360 = e.touches[0].clientX;
    });

    window.addEventListener("touchend", () => {
        isDragging360 = false;
    });

    window.addEventListener("touchmove", (e) => {
        if (!isDragging360) return;
        const deltaX = e.touches[0].clientX - startX360;
        startX360 = e.touches[0].clientX;
        currentPos360 += deltaX * 0.2;
        imgEl.style.backgroundPosition = `${currentPos360}% center`;
    });
}
