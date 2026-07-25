// main.js - Logic điều khiển trang chủ

// Lưu trữ các DOM Elements
const els = {
    categoriesContainer: document.getElementById("categories-container"),
    categoriesSkeleton: document.getElementById("categories-skeleton"),
    destinationsContainer: document.getElementById("destinations-container"),
    destinationsSkeleton: document.getElementById("destinations-skeleton"),
    tourList: document.getElementById("tourList"),
    toursSkeleton: document.getElementById("tours-skeleton"),
    heroSearchForm: document.getElementById("heroSearchForm"),
    navSearchInput: document.getElementById("navSearchInput"),
    btnZalo: document.getElementById("btnZalo"),
};

// Trạng thái ứng dụng (State)
let featuredTours = [];

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

                // Cập nhật auth nếu cần thiết sau khi thêm yêu thích
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

// Tải và hiển thị dữ liệu động từ API

// Lấy dữ liệu và hiển thị danh mục tour
async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");

        const categories = await res.json();
        renderCategories(categories);
    } catch (error) {
        console.error("Load categories error:", error);
        if (els.categoriesSkeleton) {
            els.categoriesSkeleton.innerHTML = `<div class="col-12 text-center text-muted py-4"><i class="bi bi-exclamation-triangle-fill text-warning fs-3 mb-2 d-block"></i>Không thể tải danh mục chuyến đi!</div>`;
        }
    }
}

function renderCategories(categories) {
    if (!els.categoriesContainer || !els.categoriesSkeleton) return;

    els.categoriesSkeleton.style.display = "none";
    els.categoriesContainer.style.display = "flex";

    if (categories.length === 0) {
        els.categoriesContainer.innerHTML =
            '<p class="col-12 text-center text-muted">Chưa có danh mục nào được hiển thị.</p>';
        return;
    }

    const badges = ["🏞️ VÙNG CAO", "🌊 BIỂN ĐẢO", "🏛️ DI SẢN"];

    els.categoriesContainer.innerHTML = categories
        .map(
            (cat, idx) => `
    <div class="col-12 col-md-4 mb-4">
      <div class="category-card shadow-sm" onclick="window.location.href='/tours?category=${encodeURIComponent(cat.name)}'">
        <span class="category-card-badge">${badges[idx % badges.length]}</span>
        <img src="${cat.image || "/assets/images/categories/dulichbien.png"}" alt="${cat.name}">
        <div class="category-card-overlay">
          <div class="d-flex justify-content-between align-items-end gap-2">
            <div>
              <h5 class="mb-1">${cat.name}</h5>
              <small>${cat.description || ""}</small>
            </div>
            <div class="cat-explore-btn flex-shrink-0">
              <i class="bi bi-arrow-right-circle-fill fs-3 text-warning"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
        )
        .join("");
}

// Lấy và hiển thị danh sách điểm đến nổi bật
async function loadDestinations() {
    try {
        const res = await fetch(`${API_URL}/destinations`);
        if (!res.ok) throw new Error("Failed to fetch destinations");

        const destinations = await res.json();
        renderDestinations(destinations);
    } catch (error) {
        console.error("Load destinations error:", error);
        if (els.destinationsSkeleton) {
            els.destinationsSkeleton.innerHTML = `<div class="text-center text-muted w-100 py-4"><i class="bi bi-exclamation-triangle-fill text-warning fs-3 mb-2 d-block"></i>Không thể tải điểm đến hàng đầu!</div>`;
        }
    }
}

function renderDestinations(destinations) {
    if (!els.destinationsContainer || !els.destinationsSkeleton) return;

    els.destinationsSkeleton.style.display = "none";
    els.destinationsContainer.style.display = "block";

    if (destinations.length < 4) {
        els.destinationsContainer.innerHTML =
            '<p class="text-center text-muted w-100">Chưa đủ dữ liệu điểm đến (cần ít nhất 4 điểm đến).</p>';
        return;
    }

    const des1 = destinations[0];
    const des2 = destinations[1];
    const des3 = destinations[2];
    const des4 = destinations[3];

    const createCard = (des) => `
    <div class="card border-0 rounded-4 overflow-hidden position-relative w-100 h-100 dest-card" style="cursor: pointer; min-height: 200px;" onclick="window.location.href='/tours?destination=${encodeURIComponent(des.name)}'">
      <img src="${des.image || "/assets/images/categories/dulichbien.png"}" class="card-img h-100 w-100 object-fit-cover position-absolute top-0 start-0" alt="${des.name}" style="z-index: 0; transition: transform var(--transition);">
      <div class="position-absolute bottom-0 start-0 w-100 h-50" style="background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); pointer-events: none; z-index: 1;"></div>
      ${des.badge ? `<span class="dest-badge position-absolute top-0 start-0 m-3" style="z-index: 2;">${des.badge}</span>` : ""}
      <div class="position-absolute bottom-0 start-0 w-100 p-3 p-md-4 text-start" style="z-index: 2;">
        <h4 class="fw-bold text-white mb-1">${des.name}</h4>
        <p class="fs-7 text-light mb-0 d-none d-sm-block" style="opacity: 0.8;">${des.description || ""}</p>
      </div>
    </div>
  `;

    els.destinationsContainer.innerHTML = `
    <div class="dest-grid-container">
      <div class="dest-item">${createCard(des1)}</div>
      <div class="dest-item">${createCard(des2)}</div>
      <div class="dest-item">${createCard(des3)}</div>
      <div class="dest-item">${createCard(des4)}</div>
    </div>
  `;
}

// Lấy dữ liệu và hiển thị tour nổi bật
async function loadFeaturedTours() {
    try {
        const res = await fetch(`${API_URL}/tours/featured`);
        if (!res.ok) throw new Error("Failed to fetch featured tours");

        featuredTours = await res.json();
        renderFeaturedTours(featuredTours);
    } catch (error) {
        console.error("Load tours error:", error);
        if (els.toursSkeleton) {
            els.toursSkeleton.innerHTML = `<div class="col-12 text-center text-muted py-4"><i class="bi bi-exclamation-triangle-fill text-warning fs-3 mb-2 d-block"></i>Không thể tải danh sách tour bán chạy!</div>`;
        }
    }
}

function renderFeaturedTours(tours) {
    if (!els.tourList || !els.toursSkeleton) return;

    els.toursSkeleton.style.display = "none";
    els.tourList.style.display = "flex";

    if (tours.length === 0) {
        els.tourList.innerHTML =
            '<p class="col-12 text-center text-muted">Hiện chưa có tour nổi bật nào.</p>';
        return;
    }

    // Kiểm tra tour nào đang trong danh sách yêu thích
    const user = window.currentUser ? window.currentUser() : null;
    const wishlist = user ? user.wishlist || [] : [];

    els.tourList.innerHTML = tours
        .map((tour) => {
            const isWishlisted = wishlist.includes(tour._id);

            return `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="tour-card" onclick="window.location.href='/tours/${tour.slug || tour._id}'">
          <div class="tour-card-img-wrap">
            <img src="${tour.image || "/assets/images/categories/dulichbien.png"}" alt="${tour.title || tour.name}">
            ${tour.discount ? `<span class="tour-card-badge">-${tour.discount}%</span>` : tour.isFeatured ? `<span class="tour-card-badge">Hot</span>` : ""}
            <button class="tour-card-wishlist ${isWishlisted ? "active" : ""}" data-tour-id="${tour._id}" onclick="event.stopPropagation(); toggleWishlist(this)">
              <i class="bi bi-heart-fill"></i>
            </button>
          </div>
          <div class="tour-card-body">
            <div class="tour-card-meta">
              <span><i class="bi bi-clock-fill text-primary"></i> ${tour.duration}</span>
              <span><i class="bi bi-geo-alt-fill text-primary"></i> ${tour.destination}</span>
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

// Xử lý tìm kiếm từ hero section và thanh nav
if (els.heroSearchForm) {
    els.heroSearchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const location = document.getElementById("searchLocation").value.trim();
        const date = document.getElementById("searchDate").value.trim();
        const guests = document.getElementById("searchGuests").value.trim();

        const params = new URLSearchParams();
        if (location) params.append("destination", location);
        // Tạm thời các trường Date và Guests truyền theo URL params, trang tours có thể mở rộng sau.
        if (date) params.append("date", date);
        if (guests) params.append("guests", guests);

        window.location.href = `/tours.html?${params.toString()}`;
    });
}

if (els.navSearchInput) {
    els.navSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const keyword = els.navSearchInput.value.trim();
            if (keyword) {
                window.location.href = `/tours?keyword=${encodeURIComponent(keyword)}`;
            }
        }
    });
}

// Xử lý scroll để hiệu ứng thanh nav và reveal animation
function handleScroll() {
    const navbar = document.querySelector(".vv-navbar");
    if (navbar) {
        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }
}

function initScrollReveal() {
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
}

// Form đăng ký newsletter
const newsletterForm = document.getElementById("newsletterForm");
if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
            showToast(
                `Đăng ký thành công với email: ${emailInput.value}`,
                "success",
            );
            emailInput.value = "";
        }
    });
}

// Logic đếm ngược và danh sách flash sale
let flashSaleTours = [];

async function loadFlashSaleTours() {
    try {
        const res = await fetch(`${API_URL}/tours?limit=100`);
        if (!res.ok) throw new Error("Failed to fetch tours");
        const data = await res.json();
        const all = data.tours || [];

        // Lọc các tour có giảm giá hoặc giá cũ > giá hiện tại
        flashSaleTours = all
            .filter(
                (t) => t.discount > 0 || (t.oldPrice && t.oldPrice > t.price),
            )
            .slice(0, 3);

        renderFlashSaleTours(flashSaleTours);
    } catch (error) {
        console.error("Load flash sales error:", error);
        const container = document.getElementById("flash-sale-skeleton");
        if (container) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-4">Không thể tải danh sách Flash Sale!</div>`;
        }
    }
}

function renderFlashSaleTours(tours) {
    const skeleton = document.getElementById("flash-sale-skeleton");
    const list = document.getElementById("flashSaleList");
    if (!skeleton || !list) return;

    skeleton.style.display = "none";
    list.style.display = "flex";

    if (tours.length === 0) {
        list.innerHTML =
            '<p class="col-12 text-center text-muted">Chưa có sản phẩm flash sale hôm nay.</p>';
        return;
    }

    const user = window.currentUser ? window.currentUser() : null;
    const wishlist = user ? user.wishlist || [] : [];

    list.innerHTML = tours
        .map((tour) => {
            const isWishlisted = wishlist.includes(tour._id);
            const discountPercent =
                tour.discount ||
                Math.round((1 - tour.price / tour.oldPrice) * 100);

            return `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="tour-card" onclick="window.location.href='/tours/${tour.slug || tour._id}'">
          <div class="tour-card-img-wrap">
            <img src="${tour.image || "/assets/images/categories/dulichbien.png"}" alt="${tour.title || tour.name}">
            <span class="flash-sale-badge"><i class="bi bi-lightning-fill"></i> -${discountPercent}%</span>
            <button class="tour-card-wishlist ${isWishlisted ? "active" : ""}" data-tour-id="${tour._id}" onclick="event.stopPropagation(); toggleWishlist(this)">
              <i class="bi bi-heart-fill"></i>
            </button>
          </div>
          <div class="tour-card-body">
            <div class="tour-card-meta">
              <span><i class="bi bi-clock-fill text-primary"></i> ${tour.duration}</span>
              <span><i class="bi bi-geo-alt-fill text-primary"></i> ${tour.destination}</span>
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
              <span class="tour-card-price-label">Giá Flash Sale</span>
              <div class="d-flex align-items-baseline gap-2">
                <span class="tour-card-price" style="color: var(--accent); font-weight: 800;">${(tour.price || 0).toLocaleString("vi-VN")} đ</span>
                ${tour.oldPrice ? `<span class="tour-card-price-old text-decoration-line-through">${tour.oldPrice.toLocaleString("vi-VN")} đ</span>` : ""}
              </div>
            </div>
            <span class="btn-brand fs-7 py-1.5 px-3">Săn Ngay</span>
          </div>
        </div>
      </div>
    `;
        })
        .join("");
}

function startFlashSaleCountdown() {
    const hoursEl = document.getElementById("cd-hours");
    const minutesEl = document.getElementById("cd-minutes");
    const secondsEl = document.getElementById("cd-seconds");
    if (!hoursEl) return;

    function update() {
        const now = new Date();
        const target = new Date();
        target.setHours(23, 59, 59, 999);

        let diff = target - now;
        if (diff <= 0) {
            diff = 24 * 60 * 60 * 1000;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        hoursEl.innerText = String(hours).padStart(2, "0");
        minutesEl.innerText = String(minutes).padStart(2, "0");
        secondsEl.innerText = String(seconds).padStart(2, "0");
    }

    update();
    setInterval(update, 1000);
}

// Travel shorts logic
window.playShortVideo = (videoUrl, title) => {
    const modalEl = document.getElementById("shortsModal");
    const videoPlayer = document.getElementById("shortsVideoPlayer");
    const titleEl = document.getElementById("shortsVideoTitle");
    if (!modalEl || !videoPlayer || !titleEl) return;

    titleEl.innerText = title;
    videoPlayer.src = videoUrl;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    modalEl.addEventListener(
        "hidden.bs.modal",
        function () {
            videoPlayer.pause();
            videoPlayer.src = "";
        },
        { once: true },
    );
};

// Tự động lấy frame đầu tiên của video làm ảnh đại diện cho mỗi shorts card
function initShortsThumbnails() {
    document
        .querySelectorAll(".shorts-thumb[data-video-src]")
        .forEach((img) => {
            const videoSrc = img.getAttribute("data-video-src");
            if (!videoSrc) return;

            const vid = document.createElement("video");
            vid.src = videoSrc;
            vid.crossOrigin = "anonymous";
            vid.muted = true;
            vid.playsInline = true;
            vid.preload = "metadata";

            vid.addEventListener(
                "loadeddata",
                () => {
                    vid.currentTime = 1; // Tua đến giây 1 để lấy ảnh đại diện thay vì frame đen đầu tiên
                },
                { once: true },
            );

            vid.addEventListener(
                "seeked",
                () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = vid.videoWidth || 260;
                    canvas.height = vid.videoHeight || 460;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
                    img.src = canvas.toDataURL("image/jpeg", 0.85);
                    vid.remove();
                },
                { once: true },
            );

            vid.load();
        });
}

// Phát video trực tiếp trong card shorts (không dùng modal)
// Nội bộ: phát video theo chỉ số được chọn
function playShortAtIndex(cardEl, index) {
    const videosRaw = cardEl.getAttribute("data-videos") || "";
    const videos = videosRaw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    if (!videos.length) return;

    // Giới hạn chỉ số trong phạm vi danh sách video
    const idx = ((index % videos.length) + videos.length) % videos.length;
    cardEl.dataset.shortIndex = idx;

    // Xóa video inline đang phát (nếu có)
    const existing = cardEl.querySelector("video.shorts-inline-video");
    if (existing) {
        existing.pause();
        existing.remove();
    }

    // Cập nhật số thứ tự trên badge
    const badge = cardEl.querySelector(".shorts-index-badge");
    if (badge) badge.textContent = `${idx + 1} / ${videos.length}`;

    // Tạo video inline có âm thanh và thanh điều khiển
    const vid = document.createElement("video");
    vid.src = videos[idx];
    vid.autoplay = true;
    vid.controls = true;
    vid.loop = false;
    vid.playsInline = true;
    vid.className = "shorts-inline-video";

    // Khi video kết thúc → tự chuyển sang video tiếp theo
    vid.addEventListener("ended", () => {
        const nextIdx = idx + 1;
        if (nextIdx < videos.length) {
            playShortAtIndex(cardEl, nextIdx);
        } else {
            window.stopShort(null, cardEl); // all videos done → restore thumbnail
        }
    });
    vid.addEventListener("error", () => window.stopShort(null, cardEl));

    cardEl.appendChild(vid);
    cardEl.classList.add("playing");
}

// Click vào card → bắt đầu từ video 1 (hoặc tiếp tục từ lần cuối)
window.playRandomShort = (cardEl) => {
    if (cardEl.classList.contains("playing")) return;

    // Dừng các card khác đang phát trước
    document.querySelectorAll(".shorts-card.playing").forEach((c) => {
        window.stopShort(null, c);
    });

    // Để CSS xử lý hiệu ứng làm mờ ảnh đại diện (Ambient Mode) thay vì ẩn hoàn toàn
    // const thumb = cardEl.querySelector('.shorts-thumb');
    // if (thumb) thumb.style.display = 'none';

    // Bắt đầu từ video đầu tiên
    playShortAtIndex(cardEl, 0);
};

// Chuyển sang video tiếp theo theo yêu cầu thủ công
window.nextShortVideo = (event, cardEl) => {
    event.stopPropagation();
    const videosRaw = cardEl.getAttribute("data-videos") || "";
    const videos = videosRaw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    const currentIdx = parseInt(cardEl.dataset.shortIndex || "0", 10);
    const nextIdx = (currentIdx + 1) % videos.length;
    playShortAtIndex(cardEl, nextIdx);
};

// Dừng phát video và khôi phục ảnh đại diện
window.stopShort = (event, cardEl) => {
    if (event) event.stopPropagation();
    const vid = cardEl.querySelector("video.shorts-inline-video");
    if (vid) {
        vid.pause();
        vid.remove();
    }
    // const thumb = cardEl.querySelector('.shorts-thumb');
    // if (thumb) thumb.style.display = '';
    delete cardEl.dataset.shortIndex;
    cardEl.classList.remove("playing");
};

// Tour matching quiz logic
let currentQuizStep = 1;
const quizAnswers = {
    category: "",
    budget: "",
    duration: "",
    companion: "",
};

window.openQuizModal = () => {
    const modalEl = document.getElementById("quizModal");
    if (!modalEl) return;

    currentQuizStep = 1;
    document.querySelectorAll(".quiz-step").forEach((step, idx) => {
        if (idx === 0) step.classList.add("active");
        else step.classList.remove("active");
    });
    document
        .querySelectorAll(".quiz-option-card")
        .forEach((card) => card.classList.remove("selected"));
    document.getElementById("quizProgress").style.width = "25%";
    document.getElementById("quizPrevBtn").disabled = true;
    document.getElementById("quizNextBtn").disabled = true;
    document.getElementById("quizNextBtn").innerText = "Tiếp theo";

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

window.selectQuizOption = (step, value, element) => {
    const parent = element.parentElement;
    parent
        .querySelectorAll(".quiz-option-card")
        .forEach((card) => card.classList.remove("selected"));
    element.classList.add("selected");

    if (step === 1) quizAnswers.category = value;
    else if (step === 2) quizAnswers.budget = value;
    else if (step === 3) quizAnswers.duration = value;
    else if (step === 4) quizAnswers.companion = value;

    document.getElementById("quizNextBtn").disabled = false;
};

window.prevQuizStep = () => {
    if (currentQuizStep > 1) {
        document
            .querySelector(`.quiz-step[data-step="${currentQuizStep}"]`)
            .classList.remove("active");
        currentQuizStep--;
        document
            .querySelector(`.quiz-step[data-step="${currentQuizStep}"]`)
            .classList.add("active");
        document.getElementById("quizProgress").style.width =
            `${currentQuizStep * 25}%`;
        document.getElementById("quizNextBtn").innerText = "Tiếp theo";
        document.getElementById("quizNextBtn").disabled = false;
        if (currentQuizStep === 1) {
            document.getElementById("quizPrevBtn").disabled = true;
        }
    }
};

window.nextQuizStep = async () => {
    if (currentQuizStep < 4) {
        document
            .querySelector(`.quiz-step[data-step="${currentQuizStep}"]`)
            .classList.remove("active");
        currentQuizStep++;
        document
            .querySelector(`.quiz-step[data-step="${currentQuizStep}"]`)
            .classList.add("active");
        document.getElementById("quizProgress").style.width =
            `${currentQuizStep * 25}%`;
        document.getElementById("quizPrevBtn").disabled = false;

        let selectedValue = "";
        if (currentQuizStep === 2) selectedValue = quizAnswers.budget;
        else if (currentQuizStep === 3) selectedValue = quizAnswers.duration;
        else if (currentQuizStep === 4) selectedValue = quizAnswers.companion;

        const nextBtn = document.getElementById("quizNextBtn");
        if (currentQuizStep === 4) {
            nextBtn.innerHTML =
                '<i class="bi bi-check-circle me-1"></i> Xem kết quả';
        } else {
            nextBtn.innerText = "Tiếp theo";
        }
        nextBtn.disabled = !selectedValue;
    } else {
        localStorage.setItem(
            "vivuviet_quiz_answers",
            JSON.stringify(quizAnswers),
        );
        const modalEl = document.getElementById("quizModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        showToast("Đang ghép đôi hành trình du lịch phù hợp...", "success");
        setTimeout(() => {
            window.location.href = "/tours?match=true";
        }, 1000);
    }
};

// Tải danh sách đánh giá khách hàng mới nhất
async function loadRecentReviews() {
    const container = document.getElementById("homepage-reviews-container");
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/reviews/recent`);
        if (!res.ok) throw new Error("Failed to fetch recent reviews");
        const reviews = await res.json();

        if (reviews.length === 0) {
            container.innerHTML = `<div class="col-12 text-center opacity-75">Chưa có đánh giá nào.</div>`;
            return;
        }

        container.innerHTML = reviews
            .map((review) => {
                const u = review.user || {};
                const name = u.fullname || "Khách hàng ẩn danh";
                const avatar = u.avatar || "/assets/images/avt/default.png"; // default avatar
                const loc = u.location || "Thành viên VivuViet";

                const starsHTML = Array(5)
                    .fill(0)
                    .map(
                        (_, i) =>
                            `<i class="bi ${i < review.rating ? "bi-star-fill" : "bi-star"}"></i>`,
                    )
                    .join("");

                return `
        <div class="col-11 col-md-5 col-lg-4 mb-2 flex-shrink-0" style="scroll-snap-align: start;">
            <div class="testimonial-card h-100 d-flex flex-column justify-content-between mx-2">
                <div>
                    <div class="mb-3 text-warning">
                        ${starsHTML}
                    </div>
                    <p class="fs-6 opacity-75 fst-italic">"${review.comment}"</p>
                </div>
                <div class="d-flex align-items-center mt-4 border-top border-white border-opacity-10 pt-3">
                    <img src="${avatar}" class="testimonial-avatar me-3 object-fit-cover rounded-circle" alt="${name}" onerror="this.src='/assets/images/avt/pngtree-art-boy-avatar-png-image_8855201.png'">
                    <div>
                        <h6 class="fw-bold mb-0">${name}</h6>
                        <small class="opacity-50">${loc}</small>
                    </div>
                </div>
            </div>
        </div>
      `;
            })
            .join("");
    } catch (err) {
        console.error("Error loading recent reviews:", err);
    }
}

// Khởi tạo kéo vuốt ngang cho các container
function initDragToScroll() {
    const slider = document.getElementById('homepage-reviews-container');
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Tốc độ cuộn
        slider.scrollLeft = scrollLeft - walk;
    });
}

// Khởi động toàn bộ ứng dụng trang chủ
async function initApp() {
    document.addEventListener("scroll", handleScroll);

    await Promise.all([
        loadCategories(),
        loadDestinations(),
        loadFeaturedTours(),
        loadFlashSaleTours(),
        loadRecentReviews(),
    ]);

    startFlashSaleCountdown();
    initScrollReveal();
    initShortsThumbnails(); // capture video frame thumbnails for Travel Shorts
    initDragToScroll(); // Khởi tạo kéo vuốt ngang

    document.body.classList.remove("page-loading");
    document.body.classList.add("page-ready");
}

document.addEventListener("authReady", () => {
    initApp();
});

document.addEventListener("authChange", () => {
    renderFeaturedTours(featuredTours);
    renderFlashSaleTours(flashSaleTours);
});

window.toggleWishlist = toggleWishlist;
