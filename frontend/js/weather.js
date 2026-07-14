// frontend/js/weather.js

/**
 * Hiển thị dự báo thời tiết và gợi ý hành trang sử dụng Open-Meteo API
 * @param {string} containerId ID của thẻ div chứa widget thời tiết
 * @param {number} lat Vĩ độ
 * @param {number} lng Kinh độ
 * @param {string} destName Tên địa điểm
 * @param {string} departureDate Ngày khởi hành (YYYY-MM-DD)
 */
async function renderWeatherRecommendation(
    containerId,
    lat,
    lng,
    destName,
    departureDate,
) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
    <div class="p-4 bg-light rounded-4 border">
      <div class="d-flex align-items-center justify-content-center text-muted">
        <span class="spinner-border spinner-border-sm me-2"></span> Đang tải dự báo thời tiết cho ngày ${formatDate(departureDate)}...
      </div>
    </div>
  `;

    try {
        // Tìm toạ độ chính xác cho địa điểm (vd: Phú Quốc thay vì Kiên Giang)
        let exactLat = lat;
        let exactLng = lng;
        let queryName = destName;
        
        // Cải thiện query tìm kiếm để chính xác hơn
        if (destName.toLowerCase().includes("kiên giang")) queryName = "Phú Quốc, Kiên Giang";
        
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryName)}&count=1&language=vi`;
        const geoRes = await fetch(geoUrl);
        if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
                exactLat = geoData.results[0].latitude;
                exactLng = geoData.results[0].longitude;
            }
        }

        // Gọi Open-Meteo API lấy dự báo 16 ngày
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${exactLat}&longitude=${exactLng}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSingapore&forecast_days=16`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();

        // Tìm index của ngày khởi hành trong mảng trả về
        const targetDateStr = departureDate.split("T")[0];
        const dayIndex = data.daily.time.indexOf(targetDateStr);

        let temp = 25;
        let desc = "Không có dữ liệu dự báo";
        let iconUrl = "bi-cloud text-secondary";
        let mainCondition = "clouds";

        if (dayIndex !== -1) {
            const code = data.daily.weathercode[dayIndex];
            const maxT = data.daily.temperature_2m_max[dayIndex];
            const minT = data.daily.temperature_2m_min[dayIndex];

            // Nhiệt độ trung bình
            temp = Math.round((maxT + minT) / 2);

            // Ánh xạ mã thời tiết của WMO sang giao diện
            const weatherMap = {
                0: {
                    desc: "Quang đãng, trời trong xanh",
                    icon: "bi-sun text-warning",
                    cond: "clear",
                },
                1: {
                    desc: "Phần lớn quang đãng",
                    icon: "bi-sun text-warning",
                    cond: "clear",
                },
                2: {
                    desc: "Trời có mây từng phần",
                    icon: "bi-cloud-sun text-primary",
                    cond: "clouds",
                },
                3: {
                    desc: "Trời nhiều mây u ám",
                    icon: "bi-cloud text-secondary",
                    cond: "clouds",
                },
                45: {
                    desc: "Có sương mù",
                    icon: "bi-cloud-haze text-secondary",
                    cond: "clouds",
                },
                48: {
                    desc: "Sương mù lạnh",
                    icon: "bi-cloud-haze text-secondary",
                    cond: "clouds",
                },
                51: {
                    desc: "Mưa phùn nhẹ",
                    icon: "bi-cloud-drizzle text-info",
                    cond: "drizzle",
                },
                53: {
                    desc: "Mưa phùn vừa",
                    icon: "bi-cloud-drizzle text-info",
                    cond: "drizzle",
                },
                55: {
                    desc: "Mưa phùn dày",
                    icon: "bi-cloud-drizzle text-info",
                    cond: "drizzle",
                },
                61: {
                    desc: "Mưa rào nhẹ",
                    icon: "bi-cloud-rain text-primary",
                    cond: "rain",
                },
                63: {
                    desc: "Mưa rào vừa",
                    icon: "bi-cloud-rain text-primary",
                    cond: "rain",
                },
                65: {
                    desc: "Mưa rào nặng hạt",
                    icon: "bi-cloud-rain-heavy text-primary",
                    cond: "rain",
                },
                80: {
                    desc: "Mưa rào nhẹ",
                    icon: "bi-cloud-rain text-primary",
                    cond: "rain",
                },
                81: {
                    desc: "Mưa rào vừa",
                    icon: "bi-cloud-rain text-primary",
                    cond: "rain",
                },
                82: {
                    desc: "Mưa rào rất lớn",
                    icon: "bi-cloud-rain-heavy text-primary",
                    cond: "rain",
                },
                95: {
                    desc: "Có giông bão",
                    icon: "bi-cloud-lightning-rain text-danger",
                    cond: "thunderstorm",
                },
                96: {
                    desc: "Giông bão kèm mưa đá nhỏ",
                    icon: "bi-cloud-lightning-rain text-danger",
                    cond: "thunderstorm",
                },
                99: {
                    desc: "Giông bão kèm mưa đá lớn",
                    icon: "bi-cloud-lightning-rain text-danger",
                    cond: "thunderstorm",
                },
            };

            const wInfo = weatherMap[code] || weatherMap[3];
            desc = wInfo.desc;
            iconUrl = wInfo.icon;
            mainCondition = wInfo.cond;
        } else {
            // Trường hợp ngày đi quá xa (>16 ngày), trả về mặc định trung bình
            desc = "Dự báo xa (Nhiều mây)";
            iconUrl = "bi-cloud-sun text-primary";
            mainCondition = "clouds";
        }

        // Thuật toán gợi ý trang phục & vật dụng
        const recommendations = getClothingRecommendations(temp, mainCondition);

        // Render Giao diện
        const isSidebar = containerId === "booking-weather-section";
        const leftColClass = isSidebar ? "col-12" : "col-md-5";
        const rightColClass = isSidebar ? "col-12" : "col-md-7";
        const itemColClass = isSidebar ? "col-12" : "col-sm-6";

        const html = `
      <div class="vv-weather-recommendation p-3 p-md-4 bg-white rounded-4 border shadow-sm mt-3">
        <h4 class="fw-bold text-primary-brand mb-3 fs-6">
          <i class="bi bi-cloud-sun me-2"></i>Dự báo thời tiết & Hành trang
        </h4>
        <div class="row g-3 align-items-stretch">
          
          <!-- Thông tin thời tiết -->
          <div class="${leftColClass}">
            <div class="p-3 bg-light rounded-3 d-flex flex-column ${isSidebar ? 'align-items-start text-start' : 'align-items-center text-center'} h-100 border" style="border-left: 5px solid var(--accent) !important;">
              <div class="fw-semibold text-secondary mb-1 fs-8">Dự báo tại ${queryName}</div>
              <div class="text-primary-brand fw-bold mb-2 fs-7">Ngày ${formatDate(departureDate)}</div>
              
              <div class="d-flex align-items-center ${isSidebar ? 'justify-content-start' : 'justify-content-center'} w-100">
                <i class="bi ${iconUrl} ${isSidebar ? 'fs-1' : 'display-3'} text-accent me-3"></i>
                <div class="text-start">
                  <div class="${isSidebar ? 'fs-3' : 'display-5'} fw-bold text-dark">${temp}°C</div>
                  <div class="fs-8 text-muted">${desc}</div>
                </div>
              </div>
              <a href="https://www.google.com/search?q=thời+tiết+${encodeURIComponent(queryName)}" target="_blank" class="btn btn-sm btn-outline-brand mt-3 w-100 rounded-pill fs-8"><i class="bi bi-box-arrow-up-right me-1"></i>Xem chi tiết thời tiết</a>
            </div>
          </div>

          <!-- Gợi ý hành trang -->
          <div class="${rightColClass}">
            <h6 class="fw-bold text-dark mb-2 fs-7"><i class="bi bi-bag-check text-success me-2"></i>Gợi ý chuẩn bị hành lý:</h6>
            <div class="row g-2">
              ${recommendations
                  .map(
                      (rec) => `
                <div class="${itemColClass}">
                  <div class="d-flex align-items-start p-2 bg-light rounded h-100">
                    <i class="bi ${rec.icon} text-primary fs-5 me-2 mt-0"></i>
                    <span class="fs-8 text-secondary">${rec.text}</span>
                  </div>
                </div>
              `,
                  )
                  .join("")}
            </div>
          </div>

        </div>
      </div>
    `;

        container.innerHTML = html;
        container.style.display = "block";
    } catch (error) {
        console.error("Lỗi khi tải thời tiết:", error);
        container.innerHTML = `<div class="alert alert-danger fs-7">Không thể tải thông tin thời tiết lúc này.</div>`;
    }
}

/**
 * Thuật toán gợi ý trang phục
 */
function getClothingRecommendations(temp, condition) {
    let recs = [];

    // Theo nhiệt độ
    if (temp < 15) {
        recs.push({
            icon: "bi-snow",
            text: "Trời rét, mang áo khoác phao, len dày, khăn choàng, găng tay.",
        });
        recs.push({
            icon: "bi-cup-hot",
            text: "Nên mang theo bình giữ nhiệt để uống nước ấm.",
        });
    } else if (temp < 22) {
        recs.push({
            icon: "bi-cloud-haze",
            text: "Trời se lạnh, mang áo khoác nhẹ, dài tay, cardigan.",
        });
        recs.push({
            icon: "bi-bandaid",
            text: "Mang thêm kem dưỡng ẩm tránh khô da.",
        });
    } else if (temp < 28) {
        recs.push({
            icon: "bi-brightness-high",
            text: "Thời tiết ấm áp, mặc áo thun, sơ mi, đồ thoải mái.",
        });
    } else {
        recs.push({
            icon: "bi-sun",
            text: "Trời nắng nóng, ưu tiên đồ mỏng nhẹ, thấm hút mồ hôi.",
        });
        recs.push({
            icon: "bi-sunglasses",
            text: "Đừng quên kem chống nắng, nón rộng vành, kính râm.",
        });
    }

    // Theo tình trạng (mưa/nắng/gió)
    if (
        condition.includes("rain") ||
        condition.includes("drizzle") ||
        condition.includes("thunderstorm")
    ) {
        recs.push({
            icon: "bi-umbrella",
            text: "Dự báo có mưa! Chắc chắn phải mang theo ô/dù hoặc áo mưa.",
        });
        recs.push({
            icon: "bi-shield-check",
            text: "Nên dùng balo chống nước hoặc bọc bảo vệ điện thoại.",
        });
    } else if (condition.includes("clear")) {
        recs.push({
            icon: "bi-camera",
            text: "Trời trong xanh cực đẹp! Nhớ sạc đầy pin máy ảnh.",
        });
    }

    // Luôn có 1 cái chung chung
    if (recs.length < 4) {
        recs.push({
            icon: "bi-lungs",
            text: "Mang theo thuốc cá nhân cơ bản (đau bụng, say xe, hạ sốt).",
        });
    }

    // Lấy tối đa 4 cái
    return recs.slice(0, 4);
}

function formatDate(dateStr) {
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}
