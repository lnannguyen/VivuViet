// tours/script.js - Tour Listing specific controller logic

// Lưu trữ các phần tử giao diện (DOM elements)
const els = {
    tourGrid: document.getElementById("tourGrid"),
    toursSkeleton: document.getElementById("tours-skeleton"),
    tourCount: document.getElementById("tourCount"),
    paginationContainer: document.getElementById("paginationContainer"),
    clearFilters: document.getElementById("clearFilters"),
    priceRange: document.getElementById("priceRange"),
    currentPriceDisplay: document.getElementById("currentPriceDisplay"),
    sortSelect: document.getElementById("sortSelect"),
    navSearchInput: document.getElementById("navSearchInput"),
};

// Trạng thái ứng dụng hiện tại
let allTours = [];
let filteredTours = [];
let currentPage = 1;
const itemsPerPage = 6;

// Xử lý các tham số trên đường dẫn (URL)
const urlParams = new URLSearchParams(window.location.search);
let urlCategory = urlParams.get("category");
let urlDestination = urlParams.get("destination");
let urlMinPrice = urlParams.get("minPrice");
let urlMaxPrice = urlParams.get("maxPrice");
let urlMatch = urlParams.get("match");
let urlMood = urlParams.get("mood");

// Xử lý tour yêu thích
async function toggleWishlist(btn) {
    const token = localStorage.getItem("token");
    if (!token) {
        showToast("Vui lòng đăng nhập để lưu tour yêu thích!", "error");
        setTimeout(() => (window.location.href = "/login"), 1000);
        return;
    }

    const tourId = btn.getAttribute("data-tour-id");
    if (!tourId) return;

    try {
        const res = await fetch(`${API_URL}/auth/wishlist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ tourId }),
        });

        const data = await res.json();
        if (res.ok) {
            btn.classList.toggle("active");
            showToast(data.message, "success");

            // Cập nhật dữ liệu người dùng vào bộ nhớ tạm
            const cached = localStorage.getItem("user");
            if (cached) {
                const user = JSON.parse(cached);
                user.wishlist = data.wishlist;
                localStorage.setItem("user", JSON.stringify(user));

                // Notify auth.js of changes
                if (typeof checkAuth === "function") {
                    await checkAuth();
                }
            }
        } else {
            showToast(data.message || "Thao tác yêu thích thất bại!", "error");
        }
    } catch (error) {
        console.error("Toggle wishlist error:", error);
        showToast("Lỗi kết nối máy chủ!", "error");
    }
}

// Tải và hiển thị dữ liệu động
async function loadToursData() {
    try {
        const res = await fetch(`${API_URL}/tours?limit=100`);
        if (!res.ok) throw new Error("Failed to fetch tours");

        const data = await res.json();
        allTours = data.tours || [];

        // Parse URL pre-applied filters
        preApplyURLFilters();

        // Initialize event listeners
        initEvents();

        // Apply filters and render
        applyFilters();

        // Hiển thị nội dung trang (tắt màn hình loading) content
        document.body.classList.remove("page-loading");
        document.body.classList.add("page-ready");
    } catch (error) {
        console.error("Load tours data error:", error);
        if (els.toursSkeleton) {
            els.toursSkeleton.innerHTML = `<div class="col-12 text-center text-muted py-5"><i class="bi bi-exclamation-triangle-fill text-warning fs-3 mb-2 d-block"></i>Không thể kết nối đến máy chủ du lịch!</div>`;
        }
    }
}

function preApplyURLFilters() {
    if (urlCategory) {
        const checkboxes = document.querySelectorAll(".filter-cat");
        checkboxes.forEach((cb) => {
            if (
                cb.value.toLowerCase().includes(urlCategory.toLowerCase()) ||
                urlCategory.toLowerCase().includes(cb.value.toLowerCase())
            ) {
                cb.checked = true;
            }
        });
    }

    if (urlMaxPrice) {
        els.priceRange.value = urlMaxPrice;
        els.currentPriceDisplay.innerText =
            Number(urlMaxPrice).toLocaleString("vi-VN") + " đ";
    }
}

function renderGrid() {
    if (!els.tourGrid || !els.toursSkeleton) return;

    els.toursSkeleton.style.display = "none";
    els.tourGrid.style.display = "flex";

    // Toggle matching banner
    const banner = document.getElementById("matchingAlertBanner");
    if (banner) {
        if (urlMatch === "true") {
            banner.classList.remove("d-none");
            banner.classList.add("d-flex");
        } else {
            banner.classList.remove("d-flex");
            banner.classList.add("d-none");
        }
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const toursToShow = filteredTours.slice(startIndex, endIndex);

    if (toursToShow.length === 0) {
        els.tourGrid.innerHTML =
            '<div class="col-12 text-center text-muted py-5"><i class="bi bi-search fs-2 mb-2 d-block opacity-50"></i>Không tìm thấy tour nào phù hợp với bộ lọc!</div>';
        return;
    }

    const user = window.currentUser ? window.currentUser() : null;
    const wishlist = user ? user.wishlist || [] : [];

    els.tourGrid.innerHTML = toursToShow
        .map((tour) => {
            const isWishlisted = wishlist.includes(tour._id);

            // Hiển thị nhãn nổi bật
            const matchBadge =
                urlMatch === "true" && tour.matchScore
                    ? `<span class="tour-card-match-badge"><i class="bi bi-bullseye"></i> Phù hợp ${tour.matchScore}%</span>`
                    : "";

            return `
      <div class="col-12 col-sm-6 col-md-6 col-xl-4 mb-4">
        <div class="tour-card" onclick="window.location.href='/tours/${tour.slug || tour._id}'">
          <div class="tour-card-img-wrap">
            <img src="${tour.image || "/assets/images/dulichbien.png"}" alt="${tour.title || tour.name}">
            ${matchBadge}
            ${tour.discount ? `<span class="tour-card-badge">-${tour.discount}%</span>` : tour.isFeatured ? `<span class="tour-card-badge">Hot</span>` : ""}
            <button class="tour-card-wishlist ${isWishlisted ? "active" : ""}" data-tour-id="${tour._id}" onclick="event.stopPropagation(); toggleWishlist(this)">
              <i class="bi bi-heart-fill"></i>
            </button>
          </div>
          <div class="tour-card-body">
            <div class="d-flex justify-content-between text-muted fs-8 mb-3">
              <span><i class="bi bi-clock-fill text-primary-brand"></i> ${tour.duration}</span>
              <span><i class="bi bi-geo-alt-fill text-primary-brand"></i> ${tour.destination}</span>
            </div>
            <h5 class="tour-card-title line-clamp-2">${tour.title || tour.name}</h5>
            <div class="tour-card-rating">
              <span class="stars"><i class="bi bi-star-fill"></i></span>
              <span class="fw-bold">${tour.rating ? tour.rating.toFixed(1) : "5.0"}</span>
              <span class="text-muted-brand fs-7">(${tour.reviewCount || 0} đánh giá)</span>
            </div>
          </div>
          <div class="tour-card-footer">
            <div>
              <span class="tour-card-price-label">Giá từ</span>
              <div class="d-flex align-items-baseline gap-2">
                <span class="tour-card-price">${(tour.price || 0).toLocaleString("vi-VN")} đ</span>
                ${tour.oldPrice ? `<span class="tour-card-price-old text-decoration-line-through">${tour.oldPrice.toLocaleString("vi-VN")} đ</span>` : ""}
              </div>
            </div>
            <span class="btn-brand fs-7 py-1.5 px-3">Chi tiết</span>
          </div>
        </div>
      </div>
    `;
        })
        .join("");
}

function renderPagination() {
    if (!els.paginationContainer) return;

    const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
    els.paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    // Previous button
    els.paginationContainer.innerHTML += `
    <button class="page-btn" ${currentPage === 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : `onclick="changePage(${currentPage - 1})"`} aria-label="Previous">
      <i class="bi bi-chevron-left"></i>
    </button>
  `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        els.paginationContainer.innerHTML += `
      <button class="page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>
    `;
    }

    // Next button
    els.paginationContainer.innerHTML += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : `onclick="changePage(${currentPage + 1})"`} aria-label="Next">
      <i class="bi bi-chevron-right"></i>
    </button>
  `;
}

window.changePage = (newPage) => {
    const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderGrid();
        renderPagination();
        els.tourGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
};

// Lọc và sắp xếp danh sách
function applyFilters() {
    filteredTours = [...allTours];

    // Filter by Category (Checkboxes)
    const checkedCats = Array.from(
        document.querySelectorAll(".filter-cat:checked"),
    ).map((cb) => cb.value.toLowerCase());

    if (checkedCats.length > 0) {
        filteredTours = filteredTours.filter((tour) => {
            if (!tour.category) return false;
            return checkedCats.some((cat) =>
                tour.category.toLowerCase().includes(cat),
            );
        });
    } else if (urlCategory) {
        filteredTours = filteredTours.filter(
            (tour) =>
                tour.category &&
                tour.category.toLowerCase().includes(urlCategory.toLowerCase()),
        );
    }

    // Tìm kiếm theo từ khoá (nếu có)
    const keyword = els.navSearchInput ? els.navSearchInput.value.trim().toLowerCase() : "";
    if (keyword) {
        filteredTours = filteredTours.filter(tour => {
            const titleMatch = tour.title && tour.title.toLowerCase().includes(keyword);
            const destMatch = tour.destination && tour.destination.toLowerCase().includes(keyword);
            const locMatch = tour.location && tour.location.toLowerCase().includes(keyword);
            return titleMatch || destMatch || locMatch;
        });
    }

    // Filter by Price
    const maxPrice = Number(els.priceRange.value);
    filteredTours = filteredTours.filter(
        (tour) => (tour.price || 0) <= maxPrice,
    );

    // Filter by Duration
    const activePill = document.querySelector(".filter-time.active");
    if (activePill) {
        const minDays = Number(activePill.getAttribute("data-min"));
        const maxDays = Number(activePill.getAttribute("data-max"));

        filteredTours = filteredTours.filter((tour) => {
            const days = tour.days || 1;
            return days >= minDays && days <= maxDays;
        });
    }

    // Filter by 5 Star Rating
    const is5StarChecked = document.getElementById("rate5").checked;
    if (is5StarChecked) {
        filteredTours = filteredTours.filter(
            (tour) => (tour.rating || 0) >= 4.8,
        );
    }

    // Lọc theo cảm xúc (Mood)
    if (urlMood) {
        filteredTours = filteredTours.filter(
            (tour) =>
                tour.mood &&
                tour.mood.some((m) =>
                    m.toLowerCase().includes(urlMood.toLowerCase()),
                ),
        );
    }

    // Tính toán điểm phù hợp nếu đang bật chế độ Match
    if (urlMatch === "true") {
        const answers =
            JSON.parse(localStorage.getItem("vivuviet_quiz_answers")) || {};
        filteredTours.forEach((tour) => {
            let score = 0;

            // Q1: Style (Category) - 30%
            if (answers.category === "sea" && tour.category === "Du lịch biển")
                score += 30;
            else if (
                answers.category === "mountain" &&
                tour.category === "Vùng Cao"
            )
                score += 30;
            else if (
                answers.category === "culture" &&
                tour.category === "Văn Hóa & Di Sản"
            )
                score += 30;
            else score += 10;

            // Q2: Budget (Price) - 30%
            const price = tour.price || 0;
            if (answers.budget === "low") {
                if (price <= 3000000) score += 30;
                else if (price <= 5000000) score += 15;
            } else if (answers.budget === "mid") {
                if (price > 3000000 && price <= 6000000) score += 30;
                else if (price <= 8000000) score += 15;
            } else if (answers.budget === "high") {
                if (price > 6000000) score += 30;
                else score += 15;
            }

            // Q3: Duration (Days) - 20%
            const days = tour.days || 1;
            if (answers.duration === "short" && days <= 2) score += 20;
            else if (answers.duration === "medium" && days >= 3 && days <= 4)
                score += 20;
            else if (answers.duration === "long" && days >= 5) score += 20;
            else score += 10;

            // Q4: Companion (Mood) - 20%
            if (answers.companion && tour.mood) {
                const hasMood = tour.mood.some((m) =>
                    m.toLowerCase().includes(answers.companion.toLowerCase()),
                );
                if (hasMood) score += 20;
                else score += 10;
            } else {
                score += 10;
            }

            tour.matchScore = Math.max(50, score);
        });

        // Add match-desc option if not exists
        if (
            els.sortSelect &&
            !els.sortSelect.querySelector('option[value="match-desc"]')
        ) {
            const opt = document.createElement("option");
            opt.value = "match-desc";
            opt.innerText = "Mức độ phù hợp Quiz";
            els.sortSelect.prepend(opt);
            els.sortSelect.value = "match-desc";
        }
    }

    // Apply Sorting
    const sortBy = els.sortSelect.value;
    if (sortBy === "popular") {
        filteredTours.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortBy === "match-desc") {
        filteredTours.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sortBy === "price-asc") {
        filteredTours.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
        filteredTours.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating-desc") {
        filteredTours.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    els.tourCount.innerText = filteredTours.length;
    currentPage = 1;
    renderGrid();
    renderPagination();
}

// Initialize event listeners
function initEvents() {
    document.querySelectorAll(".filter-cat, #rate5").forEach((cb) => {
        cb.addEventListener("change", applyFilters);
    });

    els.priceRange.addEventListener("input", (e) => {
        const val = Number(e.target.value);
        els.currentPriceDisplay.innerText = val.toLocaleString("vi-VN") + " đ";
    });
    els.priceRange.addEventListener("change", applyFilters);

    document.querySelectorAll(".filter-time").forEach((pill) => {
        pill.addEventListener("click", (e) => {
            const isAlreadyActive = e.target.classList.contains("active");
            document
                .querySelectorAll(".filter-time")
                .forEach((p) => p.classList.remove("active"));
            if (!isAlreadyActive) {
                e.target.classList.add("active");
            }
            applyFilters();
        });
    });

    els.sortSelect.addEventListener("change", applyFilters);

    if (els.navSearchInput) {
        els.navSearchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const keyword = els.navSearchInput.value.trim();
                if (keyword) {
                    urlDestination = keyword;
                    urlCategory = null;

                    document
                        .querySelectorAll(".filter-cat")
                        .forEach((cb) => (cb.checked = false));
                    const checkboxes =
                        document.querySelectorAll(".filter-cat");
                    checkboxes.forEach((cb) => {
                        if (
                            cb.value
                                .toLowerCase()
                                .includes(keyword.toLowerCase())
                        ) {
                            cb.checked = true;
                        }
                    });

                    applyFilters();
                }
            }
        });
    }

    if (els.clearFilters) {
        els.clearFilters.addEventListener("click", () => {
            document
                .querySelectorAll(".filter-cat, #rate5")
                .forEach((cb) => (cb.checked = false));
            els.priceRange.value = 20000000;
            els.currentPriceDisplay.innerText = "20,000,000 đ";
            document
                .querySelectorAll(".filter-time")
                .forEach((p) => p.classList.remove("active"));

            urlCategory = null;
            urlDestination = null;
            window.history.replaceState(null, "", window.location.pathname);

            els.sortSelect.value = "popular";

            applyFilters();
            showToast("Đã xóa tất cả bộ lọc!", "success");
        });
    }
}

const btnZalo = document.getElementById("btnZalo");
if (btnZalo) {
    btnZalo.addEventListener("click", (e) => {
        e.preventDefault();
        showToast(
            "Đang kết nối đến tư vấn viên trực tuyến VivuViet 24/7!",
            "success",
        );
    });
}

// Global event handlers (auth sync)
document.addEventListener("authReady", () => {
    loadToursData();
});

document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        },
    );

    reveals.forEach((el) => observer.observe(el));
});

document.addEventListener("authChange", () => {
    renderGrid();
});

window.toggleWishlist = toggleWishlist;

window.clearQuizMatching = () => {
    localStorage.removeItem("vivuviet_quiz_answers");
    window.location.href = "/tours";
};
