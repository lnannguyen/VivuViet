// profile/script.js - Điều khiển trang cá nhân người dùng

let user = null;
let bookings = [];
let selectedRating = 5;

// Helper định dạng ngày tháng chuẩn 2 chữ số DD/MM/YYYY
function formatDateVN(dateInput) {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// Lưu trữ các phần tử giao diện (DOM elements)
const els = {
    sidebarName: document.getElementById("sidebar-name"),
    sidebarAvatar: document.getElementById("sidebar-avatar"),
    sidebarPoints: document.getElementById("sidebar-points"),
    sidebarMembership: document.getElementById("sidebar-membership"),
    profileName: document.getElementById("profileName"),
    profileEmail: document.getElementById("profileEmail"),
    profilePhone: document.getElementById("profilePhone"),
    profileDob: document.getElementById("profileDob"),
    profileAddress: document.getElementById("profileAddress"),
    tabAvatar: document.getElementById("tab-avatar"),
    tabName: document.getElementById("tab-name"),
    tabMembership: document.getElementById("tab-membership"),
    bookingsContainer: document.getElementById("bookings-list-container"),
    reviewsContainer: document.getElementById("reviews-list-container"),
    wishlistGrid: document.getElementById("wishlist-grid-container"),
    passportContainer: document.getElementById("passport-stamps-container"),
    achievementsContainer: document.getElementById("achievements-container"),
    vouchersContainer: document.getElementById("vouchers-wallet-container"),
    notificationsContainer: document.getElementById(
        "notifications-list-container",
    ),
    redeemPointsBalance: document.getElementById("redeem-points-balance"),
    navSearchInput: document.getElementById("navSearchInput"),
};

const VIETNAM_PROVINCES = [
    { name: "Hà Nội", key: "hà nội", img: "/assets/images/hanoi.png" },
    { name: "Sapa, Lào Cai", key: "lào cai", img: "/assets/images/sapa.jpg" },
    {
        name: "Hạ Long, Quảng Ninh",
        key: "quảng ninh",
        img: "/assets/images/halong.png",
    },
    {
        name: "Phú Quốc, Kiên Giang",
        key: "kiên giang",
        img: "/assets/images/phuquoc.png",
    },
    {
        name: "Nha Trang, Khánh Hòa",
        key: "khánh hòa",
        img: "/assets/images/bien.png",
    },
    {
        name: "Hội An, Quảng Nam",
        key: "quảng nam",
        img: "/assets/images/hoian.png",
    },
    {
        name: "Đà Lạt, Lâm Đồng",
        key: "lâm đồng",
        img: "/assets/images/sanmay.png",
    },
    { name: "Cao Bằng", key: "cao bằng", img: "/assets/images/caobang.png" },
    { name: "Ninh Bình", key: "ninh bình", img: "/assets/images/ninhbinh.png" },
];

// Khởi tạo dữ liệu
document.addEventListener("DOMContentLoaded", async () => {
    await checkAuth();

    user = window.currentUser ? window.currentUser() : null;
    if (!user) {
        showToast("Vui lòng đăng nhập để xem trang cá nhân!", "error");
        setTimeout(() => (window.location.href = "/login"), 1200);
        return;
    }

    // Gán thông tin người dùng lên sidebar
    els.sidebarName.innerText = user.fullname;
    els.sidebarAvatar.src =
        user.avatar ||
        "/assets/images/avt/pngtree-avatar-male-2-png-image_21200797.png";
    els.sidebarPoints.innerText = user.vivupoints || 0;
    els.sidebarMembership.innerText = `${user.membership || "standard"} Member`;

    // Tự động điền thông tin cá nhân
    els.profileName.value = user.fullname;
    els.profileEmail.value = user.email;
    els.profilePhone.value = user.phone || "";
    
    // Fill inner tab fields
    els.tabAvatar.src = user.avatar || "/assets/images/avt/pngtree-avatar-male-2-png-image_21200797.png";
    els.tabName.innerText = user.fullname;
    els.tabMembership.innerText = `${user.membership || "standard"} Member`;

    // Fill new profile fields
    if (user.dob) {
        els.profileDob.value = user.dob.split('T')[0];
    }
    if (user.address) {
        els.profileAddress.value = user.address;
    }
    if (user.gender) {
        const genderRadio = document.querySelector(`input[name="profileGender"][value="${user.gender}"]`);
        if (genderRadio) genderRadio.checked = true;
    }

    // Xác định tab nào đang mở dựa trên URL hiện tại
    let activeTab = "info";
    const pathname = window.location.pathname;
    if (pathname.includes("/info")) activeTab = "info";
    else if (pathname.includes("/bookings")) activeTab = "bookings";
    else if (pathname.includes("/reviews")) activeTab = "reviews";
    else if (pathname.includes("/wishlist")) activeTab = "wishlist";
    else if (pathname.includes("/passport")) activeTab = "passport";
    else if (pathname.includes("/achievements")) activeTab = "achievements";
    else if (pathname.includes("/vouchers") || pathname.includes("/points"))
        activeTab = "vouchers";
    else if (pathname.includes("/notifications")) activeTab = "notifications";
    else {
        const query = new URLSearchParams(window.location.search);
        activeTab = query.get("tab") || "info";
    }
    switchProfileTab(activeTab);

    // Khởi tạo tính năng đánh giá sao trong popup
    initReviewStars();

    // Tải các dữ liệu cần thiết từ máy chủ
    loadMyBookings();
    loadMyReviews();
    loadWishlistTours();
    loadPassportStamps();
    loadAchievements();
    loadVouchers();
    loadNotifications();

    // Hiển thị nội dung trang (tắt màn hình loading)
    document.body.classList.remove("page-loading");
    document.body.classList.add("page-ready");
});

// Chuyển đổi giữa các tab trong sidebar
window.switchProfileTab = (tabName) => {
    // Cập nhật URL mà không tải lại trang
    const cleanPath = `/profile/${tabName === "info" ? "info" : tabName}`;
    window.history.replaceState(null, "", cleanPath);

    // Cập nhật trạng thái đổi màu cho menu đang chọn
    document.querySelectorAll(".profile-menu-link").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("data-tab") === tabName) {
            link.classList.add("active");
        }
    });

    // Hiển thị nội dung tab tương ứng
    document.querySelectorAll(".profile-tab-pane").forEach((pane) => {
        pane.classList.remove("active");
    });

    const activePane = document.getElementById(`tab-${tabName}`);
    if (activePane) activePane.classList.add("active");
};

// Bật chế độ chỉnh sửa hồ sơ
window.enableProfileEdit = () => {
    els.profileName.removeAttribute("disabled");
    els.profilePhone.removeAttribute("disabled");
    els.profileDob.removeAttribute("disabled");
    els.profileAddress.removeAttribute("disabled");
    document.getElementsByName("profileGender").forEach(radio => radio.removeAttribute("disabled"));

    document.getElementById("btnEditProfile").classList.add("d-none");
    document.getElementById("btnEditProfile").classList.remove("d-flex");
    document.getElementById("btnSaveProfile").classList.remove("d-none");
    els.profileName.focus();
};

// Cập nhật thông tin cá nhân
async function saveProfileInfo() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fullname = els.profileName.value.trim();
    const phone = els.profilePhone.value.trim();
    const dob = els.profileDob.value || null;
    const address = els.profileAddress.value.trim();
    const genderEl = document.querySelector('input[name="profileGender"]:checked');
    const gender = genderEl ? genderEl.value : null;

    try {
        const res = await fetch(`${API_URL}/users/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fullname, phone, dob, gender, address }),
        });

        const data = await res.json();
        if (res.ok) {
            showToast("Cập nhật hồ sơ thành công!", "success");

            // Cập nhật sidebar sau khi lưu
            els.sidebarName.innerText = fullname;
            els.tabName.innerText = fullname;

            // Cập nhật bộ nhớ tạm (cache) người dùng
            user.fullname = fullname;
            user.phone = phone;
            user.dob = dob;
            user.gender = gender;
            user.address = address;
            localStorage.setItem("user", JSON.stringify(user));

            // Khóa lại form
            els.profileName.setAttribute("disabled", "true");
            els.profilePhone.setAttribute("disabled", "true");
            els.profileDob.setAttribute("disabled", "true");
            els.profileAddress.setAttribute("disabled", "true");
            document.getElementsByName("profileGender").forEach(radio => radio.setAttribute("disabled", "true"));

            document.getElementById("btnEditProfile").classList.remove("d-none");
            document.getElementById("btnEditProfile").classList.add("d-flex");
            document.getElementById("btnSaveProfile").classList.add("d-none");
        } else {
            showToast(data.message || "Cập nhật thất bại!", "error");
        }
    } catch (error) {
        console.error("Update profile error:", error);
        showToast("Lỗi máy chủ kết nối!", "error");
    }
}

window.changeAvatarDemo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const res = await fetch(`${API_URL}/users/profile/avatar`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                showToast("Cập nhật ảnh đại diện thành công!", "success");
                user = data.user;
                localStorage.setItem("user", JSON.stringify(user));
                els.sidebarAvatar.src = user.avatar;
                els.tabAvatar.src = user.avatar;
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast(data.message || "Cập nhật thất bại!", "error");
            }
        } catch (error) {
            console.error("Update avatar error:", error);
            showToast("Lỗi máy chủ kết nối!", "error");
        }
    };
    fileInput.click();
};

// Quản lý lịch sử đặt tour
async function loadMyBookings() {
    const token = localStorage.getItem("token");
    if (!token || !els.bookingsContainer) return;

    try {
        const res = await fetch(`${API_URL}/bookings/my`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
        });
        if (!res.ok) throw new Error("Fetch failed");
        bookings = await res.json();

        renderBookingHistory();
    } catch (error) {
        console.error("Load bookings history error:", error);
        els.bookingsContainer.innerHTML =
            '<p class="text-center text-muted py-4">Lỗi tải dữ liệu lịch sử đặt tour.</p>';
    }
}

function renderBookingHistory() {
    if (bookings.length === 0) {
        els.bookingsContainer.innerHTML =
            '<p class="text-center text-muted py-5"><i class="bi bi-calendar3 fs-2 mb-2 d-block opacity-50"></i>Bạn chưa đặt chuyến đi nào trong lịch sử.</p>';
        return;
    }

    els.bookingsContainer.innerHTML = bookings
        .map((b) => {
            const tour = b.tour || (typeof b.tour_id === 'object' ? b.tour_id : {}) || {};

            // Chọn màu hiển thị cho trạng thái đơn hàng
            let statusText = "Đang xử lý";
            let badgeClass = "bg-accent text-white";
            if (b.booking_status === "paid") {
                statusText = "Đã thanh toán";
                badgeClass = "bg-success text-white";
            } else if (b.booking_status === "cancelled") {
                statusText = "Đã hủy";
                badgeClass = "bg-danger text-white";
            } else if (b.booking_status === "completed") {
                statusText = "Đã hoàn thành";
                badgeClass = "bg-brand text-white";
            }

            const travelDate = formatDateVN(b.departure_date);
            const isCompleted = b.booking_status === "completed";
            const isPastDeparture = new Date(b.departure_date) < new Date();
            const isCancellable =
                (b.booking_status === "pending" ||
                    b.booking_status === "paid") &&
                !isPastDeparture;

            return `
      <div class="card mb-3 p-3 border border-light shadow-none bg-white">
        <div class="row g-3 align-items-center">
          <div class="col-md-2 text-center text-md-start">
            <img src="${tour.image || "/assets/images/dulichbien.png"}" class="rounded-3 object-fit-cover w-100" style="max-height: 100px;">
          </div>
          <div class="col-md-6">
            <span class="badge ${badgeClass} fs-9 mb-1 text-uppercase">${statusText}</span>
            <h5 class="fw-bold fs-7 mb-1 text-primary-brand">${tour.title || tour.name || "Hành trình du lịch"}</h5>
            <div class="fs-8 text-secondary">
              <span class="me-2"><i class="bi bi-calendar3 me-1"></i>Khởi hành: ${travelDate}</span>
              <span><i class="bi bi-people-fill me-1"></i>Số khách: ${b.quantity} người</span>
            </div>
          </div>
          <div class="col-md-2 text-center text-md-end">
            <span class="fs-8 text-muted d-block">Tổng số tiền</span>
            <span class="fw-bold text-accent fs-6">${b.final_price.toLocaleString("vi-VN")} đ</span>
          </div>
          <div class="col-md-2 text-center text-md-end">
            ${
                isCompleted
                    ? (b.isReviewed 
                        ? `<button class="btn btn-view-review rounded-pill fs-8 py-1.5 px-3 w-100 mb-1" onclick="openViewReviewModal('${b._id}')">Xem đánh giá</button>`
                        : `<button class="btn btn-outline-brand rounded-pill fs-8 py-1.5 px-3 w-100 mb-1" onclick="openReviewModal('${tour._id}', '${b._id}')">Viết đánh giá</button>`)
                    : ""
            }
            ${
                b.booking_status === "paid" || (b.booking_status === "pending" && isPastDeparture)
                    ? `
              <button class="btn btn-success rounded-pill fs-8 py-1.5 px-3 w-100 mb-1" onclick="completeBooking('${b._id}')">Hoàn thành Tour</button>
            `
                    : ""
            }
            ${
                isCancellable
                    ? `
              <button class="btn btn-outline-accent rounded-pill fs-8 py-1.5 px-3 w-100" onclick="cancelBooking('${b._id}')">Yêu cầu hủy</button>
            `
                    : ""
            }
          </div>
        </div>
      </div>
    `;
        })
        .join("");
}

window.completeBooking = async (bookingId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (
        !confirm(
            "Bạn có chắc chắn đánh dấu tour này đã hoàn thành không? (Sẽ được cấp Passport & Thành tựu)",
        )
    )
        return;

    try {
        const res = await fetch(`${API_URL}/bookings/${bookingId}/complete`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
            showToast(
                "Hoàn thành chuyến đi! Bạn đã nhận được cập nhật Hộ chiếu.",
                "success",
            );

            // Cập nhật thông tin user sau khi hoàn thành - tải lại dữ liệu gamification
            const userRes = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userData = await userRes.json();
            if (userRes.ok && userData.user) {
                user = userData.user;
                localStorage.setItem("user", JSON.stringify(user));
                // Làm mới các tab Gamification
                loadPassportStamps();
                loadAchievements();
                loadNotifications();
            }

            loadMyBookings();
        } else {
            showToast(data.message || "Lỗi cập nhật tour!", "error");
        }
    } catch (error) {
        console.error("Complete booking error:", error);
        showToast("Lỗi máy chủ kết nối!", "error");
    }
};

window.cancelBooking = async (bookingId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (
        !confirm(
            "Bạn có chắc chắn muốn gửi yêu cầu hủy đơn đặt tour này không?",
        )
    )
        return;

    try {
        const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
            showToast("Yêu cầu huỷ tour thành công!", "success");
            loadMyBookings();
        } else {
            showToast(data.message || "Huỷ tour thất bại!", "error");
        }
    } catch (error) {
        console.error("Cancel booking error:", error);
        showToast("Lỗi máy chủ kết nối!", "error");
    }
};

// Danh sách tour yêu thích
async function loadWishlistTours() {
    if (!els.wishlistGrid) return;

    const wishlist = user ? user.wishlist || [] : [];
    if (wishlist.length === 0) {
        els.wishlistGrid.innerHTML =
            '<div class="col-12 text-center text-muted py-5"><i class="bi bi-heart fs-2 mb-2 d-block opacity-50"></i>Bạn chưa thích tour du lịch nào.</div>';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/tours?limit=100`);
        if (!res.ok) throw new Error("Api failed");
        const data = await res.json();

        // Lọc chỉ lấy các tour nằm trong wishlist
        const wishlisted = (data.tours || []).filter((t) =>
            wishlist.includes(t._id),
        );

        if (wishlisted.length === 0) {
            els.wishlistGrid.innerHTML =
                '<div class="col-12 text-center text-muted py-5"><i class="bi bi-heart fs-2 mb-2 d-block opacity-50"></i>Bạn chưa thích tour du lịch nào.</div>';
            return;
        }

        els.wishlistGrid.innerHTML = wishlisted
            .map(
                (t) => `
      <div class="col-md-6 col-lg-4">
        <div class="tour-card" onclick="window.location.href='/tours/${t.slug || t._id}'">
          <div class="tour-card-img-wrap">
            <img src="${t.image || "/assets/images/dulichbien.png"}" alt="${t.title || t.name}">
            <button class="tour-card-wishlist active" data-tour-id="${t._id}" onclick="event.stopPropagation(); toggleWishlistFromProfile(this)">
              <i class="bi bi-heart-fill"></i>
            </button>
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
            .join("");
    } catch (error) {
        console.error("Load wishlist error:", error);
        els.wishlistGrid.innerHTML =
            '<div class="col-12 text-center text-muted py-4">Lỗi kết nối máy chủ wishlist.</div>';
    }
}

async function loadMyReviews() {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
        const res = await fetch(`${API_URL}/reviews/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const reviews = await res.json();
        
        const container = els.reviewsContainer;
        if (!reviews || reviews.length === 0) {
            container.innerHTML = `<div class="text-center py-5 text-muted">
                <i class="bi bi-star text-muted opacity-50 mb-3" style="font-size: 3rem;"></i>
                <h5>Chưa có đánh giá nào</h5>
                <p>Bạn chưa viết đánh giá cho chuyến đi nào.</p>
            </div>`;
            return;
        }

        container.innerHTML = reviews.map(r => {
            const stars = Array(5).fill(0).map((_, i) => 
                `<i class="bi bi-star-fill ${i < r.rating ? 'text-warning' : 'text-muted opacity-25'}"></i>`
            ).join("");
            
            let mediaHtml = "";
            if ((r.images && r.images.length > 0) || (r.videos && r.videos.length > 0)) {
                mediaHtml += `<div class="review-media-grid mt-3">`;
                if (r.images) {
                    r.images.forEach(img => {
                        mediaHtml += `<div class="media-item"><img src="${img}" alt="Review image" class="img-fluid rounded object-fit-cover w-100 h-100"></div>`;
                    });
                }
                if (r.videos) {
                    r.videos.forEach(vid => {
                        mediaHtml += `<div class="media-item"><video src="${vid}" class="w-100 h-100 object-fit-cover rounded" muted controls></video></div>`;
                    });
                }
                mediaHtml += `</div>`;
            }

            return `
            <div class="card border-0 shadow-sm rounded-4 mb-4" style="background-color: #d5ebcc;">
                <div class="card-body p-4">
                    <div class="d-flex align-items-center mb-3">
                        <img src="${r.tour?.image || '/assets/images/placeholder.jpg'}" alt="Tour" class="rounded-3 me-3 object-fit-cover" style="width: 60px; height: 60px;">
                        <div>
                            <h6 class="mb-1 text-primary-brand fw-bold">${r.tour?.name || 'Chuyến đi không xác định'}</h6>
                            <div class="fs-8 text-muted">Đã viết ngày: ${formatDateVN(r.createdAt)}</div>
                        </div>
                    </div>
                    <hr class="text-white opacity-75 my-3 border-2">
                    <div class="mb-2 fs-6">${stars}</div>
                    <p class="mb-0 text-secondary">${r.comment}</p>
                    ${mediaHtml}
                </div>
            </div>`;
        }).join("");

    } catch (error) {
        console.error("Load reviews error:", error);
        els.reviewsContainer.innerHTML = '<div class="text-center text-muted py-4">Lỗi kết nối máy chủ khi tải đánh giá.</div>';
    }
}

window.toggleWishlistFromProfile = async (btn) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const tourId = btn.getAttribute("data-tour-id");

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
            showToast(data.message, "success");
            user.wishlist = data.wishlist;
            localStorage.setItem("user", JSON.stringify(user));
            loadWishlistTours();
        }
    } catch (e) {
        console.error(e);
    }
};

// Hộ chiếu du lịch (passport stamps)
function loadPassportStamps() {
    if (!els.passportContainer) return;

    // Lấy các điểm đến từ đơn hàng đã hoàn thành thực tế
    const completedBookings = (bookings || []).filter(
        (b) => b.booking_status === "completed",
    );

    // Tạo danh sách stamp động từ các tour đã đi xong
    const dynamicStamps = completedBookings.map((b) => {
        const tourObj = b.tour || {};
        const destStr = tourObj.destination || tourObj.location || tourObj.name || tourObj.title || "";
        return {
            location: destStr,
            visitDate: b.departure_date,
        };
    });

    const userStamps = user.passportStamps || [];

    els.passportContainer.innerHTML = VIETNAM_PROVINCES.map((prov) => {
        // Kiểm tra xem tỉnh thành có đơn hàng đã hoàn thành không
        const matchingCompleted = dynamicStamps.find((ds) =>
            prov.name.toLowerCase().includes(ds.location.toLowerCase()) ||
            ds.location.toLowerCase().includes(prov.key.toLowerCase()) ||
            ds.location.toLowerCase().includes(prov.name.toLowerCase()),
        );

        // Kiểm tra trong user.passportStamps (chỉ ghép nếu tour đó thuộc đơn hoàn thành)
        const matchingUserStamp = userStamps.find((us) =>
            (prov.name.toLowerCase().includes(us.location.toLowerCase()) ||
             us.location.toLowerCase().includes(prov.key.toLowerCase())) &&
            completedBookings.some((cb) => {
                const cbDest = cb.tour?.destination || cb.tour?.location || cb.tour?.name || "";
                return cbDest.toLowerCase().includes(us.location.toLowerCase()) || us.location.toLowerCase().includes(cbDest.toLowerCase());
            })
        );

        const isVisited = matchingCompleted || matchingUserStamp;
        const stampDate = matchingCompleted
            ? matchingCompleted.visitDate
            : matchingUserStamp?.lastVisitDate || matchingUserStamp?.firstVisitDate;

        if (isVisited) {
            return `
        <div class="passport-stamp unlocked">
          <div class="passport-stamp-count">1</div>
          <div class="passport-stamp-name">${prov.name}</div>
          <div class="passport-stamp-date">${formatDateVN(stampDate)}</div>
        </div>
      `;
        } else {
            return `
        <div class="passport-stamp locked">
          <div class="passport-stamp-name" style="opacity: 0.25;">${prov.name}</div>
        </div>
      `;
        }
    }).join("");
}

// Hệ thống thành tựu
function loadAchievements() {
    if (!els.achievementsContainer) return;

    const unlocked = user.achievements || [];
    const completedBookings = (bookings || []).filter(
        (b) => b.booking_status === "completed",
    );
    const completedCount = completedBookings.length;

    // Danh sách huy hiệu mặc định
    const badgesList = [
        {
            label: "Khởi đầu mới",
            desc: "Hoàn thành chuyến đi đầu tiên",
            icon: "bi-rocket-takeoff-fill",
            color: "#3b82f6",
            autoCheck: () => completedCount >= 1,
        },
        {
            label: "Nhà thám hiểm",
            desc: "Chinh phục 5 chuyến đi cùng VivuViet",
            icon: "bi-compass-fill",
            color: "#10b981",
            autoCheck: () => completedCount >= 5,
        },
        {
            label: "Chinh phục Sapa",
            desc: "Đã hoàn thành tour vùng cao Tây Bắc",
            icon: "bi-triangle-half",
            color: "#0E5E3A",
            autoCheck: () =>
                completedBookings.some((b) =>
                    (b.tour?.name || b.tour?.title || "")
                        .toLowerCase()
                        .includes("sapa"),
                ),
        },
        {
            label: "Khám phá Hạ Long",
            desc: "Trải nghiệm thuyền vịnh kì quan",
            icon: "bi-tsunami",
            color: "#F97316",
            autoCheck: () =>
                completedBookings.some((b) =>
                    (b.tour?.name || b.tour?.title || "")
                        .toLowerCase()
                        .includes("hạ long"),
                ),
        },
        {
            label: "Văn hóa Hội An",
            desc: "Tham quan phố cổ lồng đèn di sản",
            icon: "bi-shop",
            color: "#EAB308",
            autoCheck: () =>
                completedBookings.some((b) =>
                    (b.tour?.name || b.tour?.title || "")
                        .toLowerCase()
                        .includes("hội an"),
                ),
        },
        {
            label: "Biển xanh Phú Quốc",
            desc: "Nghỉ dưỡng thiên đường đảo ngọc",
            icon: "bi-water",
            color: "#06B6D4",
            autoCheck: () =>
                completedBookings.some((b) =>
                    (b.tour?.name || b.tour?.title || "")
                        .toLowerCase()
                        .includes("phú quốc"),
                ),
        },
    ];

    // Ghép thêm các thành tựu từ backend nếu chưa có trong danh sách
    unlocked.forEach((u) => {
        if (
            !badgesList.some(
                (b) => b.label.toLowerCase() === u.label.toLowerCase(),
            )
        ) {
            badgesList.push({
                label: u.label,
                desc: "Thành tựu đặc biệt",
                icon:
                    u.icon && u.icon.startsWith("bi-")
                        ? u.icon
                        : "bi-trophy-fill",
                color: u.color || "#6b7280",
                autoCheck: () => true,
            });
        }
    });

    els.achievementsContainer.innerHTML = badgesList
        .map((b) => {
            const isUnlocked =
                (typeof b.autoCheck === "function" && b.autoCheck()) ||
                unlocked.some(
                    (u) =>
                        u.label.toLowerCase().includes(b.label.toLowerCase()) ||
                        b.label.toLowerCase().includes(u.label.toLowerCase()),
                );

            return `
      <div class="achievement-badge-card ${isUnlocked ? "" : "locked"}">
        <div class="achievement-badge-icon" style="color: ${isUnlocked ? b.color : "#ccc"}; border-color: ${isUnlocked ? b.color : "#e5e7eb"}">
          <i class="bi ${b.icon}"></i>
        </div>
        <div class="achievement-badge-label">${b.label}</div>
        <div class="achievement-badge-desc">${isUnlocked ? "Đã mở khóa" : b.desc}</div>
      </div>
    `;
        })
        .join("");
}

// Ví Voucher và đổi điểm
function loadVouchers() {
    if (!els.vouchersContainer) return;

    const voucherList = user.vouchers || [];
    if (voucherList.length === 0) {
        els.vouchersContainer.innerHTML =
            '<p class="text-center text-muted col-12 py-5">Ví của bạn hiện đang rỗng. Hãy tham gia thêm tour để tích lũy điểm thưởng!</p>';
        return;
    }

    els.vouchersContainer.innerHTML = voucherList
        .map((v) => {
            return `
      <div class="voucher-ticket ${v.isUsed ? "opacity-50" : ""}">
        <div class="voucher-ticket-left" style="background-color: ${v.isUsed ? "#6B7280" : "var(--primary)"}">
          <div class="fs-8">VOUCHER</div>
          <div class="fs-5">${v.discount_amount >= 1000 ? v.discount_amount / 1000 + "k" : v.discount_amount}</div>
        </div>
        <div class="voucher-ticket-right">
          <div>
            <div class="voucher-ticket-title">${v.code}</div>
            <div class="voucher-ticket-desc">Đơn tối thiểu: ${v.min_spend.toLocaleString("vi-VN")} đ. HSD: ${formatDateVN(v.expiry_date)}</div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <span class="voucher-ticket-code">${v.code}</span>
            <span class="badge ${v.isUsed ? "bg-secondary" : "bg-success"} rounded-3 fs-9">${v.isUsed ? "Đã dùng" : "Khả dụng"}</span>
          </div>
        </div>
      </div>
    `;
        })
        .join("");
}

window.redeemPointsModal = () => {
    els.redeemPointsBalance.innerText = user.vivupoints || 0;
    const modalEl = document.getElementById("redeemPointsModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

window.redeemVoucherAction = async (val, cost) => {
    if (user.vivupoints < cost) {
        showToast("Tài khoản của bạn không đủ số dư VivuPoints!", "error");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/users/redeem-points`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ pointsToRedeem: cost }),
        });

        const data = await res.json();

        if (res.ok) {
            if (!user.vouchers) user.vouchers = [];
            user.vouchers.push(data.voucher);
            user.vivupoints = data.vivupoints;

            localStorage.setItem("user", JSON.stringify(user));
            if (els.sidebarPoints)
                els.sidebarPoints.innerText = user.vivupoints;

            showToast(
                "Đổi điểm thành công! Hãy kiểm tra ví Voucher.",
                "success",
            );

            // Đóng modal sau khi đổi điểm
            const modalEl = document.getElementById("redeemPointsModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            loadVouchers();
            els.redeemPointsBalance.innerText = user.vivupoints;
        } else {
            showToast(data.message || "Lỗi quy đổi điểm", "error");
        }
    } catch (error) {
        console.error("Redeem points error:", error);
        showToast("Máy chủ phản hồi chậm, vui lòng thử lại!", "error");
    }
};

// Hệ thống thông báo
function loadNotifications() {
    if (!els.notificationsContainer) return;

    const notifs = user.notifications || [];
    if (notifs.length === 0) {
        els.notificationsContainer.innerHTML =
            '<p class="text-center text-muted py-5">Không có thông báo mới.</p>';
        return;
    }

    els.notificationsContainer.innerHTML = notifs
        .map((n) => {
            return `
      <div class="p-3 border border-light rounded-3 bg-light d-flex align-items-center justify-content-between ${n.isRead ? "opacity-75" : "border-primary border-opacity-10"}">
        <div class="d-flex align-items-center gap-3">
          <div class="fs-4 text-primary"><i class="bi bi-bell-fill"></i></div>
          <div>
            <div class="fw-bold fs-7 ${n.isRead ? "text-secondary" : "text-primary"}">${n.title}</div>
            <div class="fs-8 text-secondary mt-1">${n.content}</div>
          </div>
        </div>
        <div class="fs-9 text-muted">${formatDateVN(n.createdAt)}</div>
      </div>
    `;
        })
        .join("");
}

window.markAllNotificationsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    user.notifications = (user.notifications || []).map((n) => ({
        ...n,
        isRead: true,
    }));

    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ notifications: user.notifications }),
        });

        if (res.ok) {
            localStorage.setItem("user", JSON.stringify(user));
            loadNotifications();
            showToast("Đã đánh dấu đọc tất cả thông báo!", "success");
        }
    } catch (e) {
        console.error(e);
    }
};

// Tương tác viết đánh giá (review)
function initReviewStars() {
    const stars = document.querySelectorAll("#reviewStarsArea i");
    stars.forEach((star) => {
        star.addEventListener("click", (e) => {
            selectedRating = Number(e.target.getAttribute("data-rating"));

            // Tô vàng các sao đã chọn
            stars.forEach((s) => {
                const rVal = Number(s.getAttribute("data-rating"));
                if (rVal <= selectedRating) {
                    s.className = "bi bi-star-fill active";
                } else {
                    s.className = "bi bi-star";
                }
            });
        });
    });
}

window.openReviewModal = (tourId, bookingId) => {
    document.getElementById("reviewTourId").value = tourId;
    document.getElementById("reviewBookingId").value = bookingId;
    document.getElementById("reviewComment").value = "";

    // Đặt lại sao về mặc định 5 sao
    selectedRating = 5;
    document.querySelectorAll("#reviewStarsArea i").forEach((s) => {
        s.className = "bi bi-star-fill active";
    });

    const modalEl = document.getElementById("writeReviewModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

// Biến toàn cục để lưu trữ các file media đã chọn
let selectedReviewMedia = [];

window.submitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const tourId = document.getElementById("reviewTourId").value;
    const bookingId = document.getElementById("reviewBookingId").value;
    const comment = document.getElementById("reviewComment").value.trim();
    
    // Thu thập file đã chọn từ state thay vì input trực tiếp
    const files = selectedReviewMedia;
    
    let imgCount = 0;
    let vidCount = 0;
    const formData = new FormData();
    formData.append("tour_id", tourId);
    formData.append("booking_id", bookingId);
    formData.append("rating", selectedRating);
    formData.append("comment", comment);
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
            if (imgCount < 3) {
                formData.append("images", file);
                imgCount++;
            }
        } else if (file.type.startsWith("video/")) {
            if (vidCount < 2) {
                formData.append("videos", file);
                vidCount++;
            }
        }
    }

    try {
        // Gửi đánh giá lên endpoint reviews
        const res = await fetch(`${API_URL}/reviews`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await res.json();
        if (res.ok) {
            const points = data.earnedPoints || 50;
            showToast(
                `Đăng đánh giá thành công! Bạn được cộng ${points} VivuPoints`,
                "success",
            );
            
            const modalEl = document.getElementById("writeReviewModal");
            const inst = bootstrap.Modal.getInstance(modalEl);
            if (inst) inst.hide();

            // Cập nhật điểm ngay tại local
            user.vivupoints += points;
            els.sidebarPoints.innerText = user.vivupoints;
            localStorage.setItem("user", JSON.stringify(user));

            // Tải lại lịch sử đặt tour để cập nhật trạng thái
            loadMyBookings();
        } else {
            showToast(
                data.message || "Gửi đánh giá không thành công!",
                "error"
            );
            
            if (data.message === "Bạn đã đánh giá tour này rồi!") {
                const modalEl = document.getElementById("writeReviewModal");
                const inst = bootstrap.Modal.getInstance(modalEl);
                if (inst) inst.hide();
                loadMyBookings();
            }
        }
        // Reset state sau khi gửi xong
        selectedReviewMedia = [];
        document.getElementById("reviewMedia").value = "";
        document.getElementById("mediaPreview").innerHTML = "";
        document.getElementById("btnSubmitReview").innerText = "GỬI ĐÁNH GIÁ ĐỂ CỘNG 50 VI-POINTS";
    } catch (error) {
        console.error("Submit review error:", error);
        showToast("Lỗi kết nối máy chủ gửi đánh giá!", "error");
    }
};

// Khởi tạo preview file khi người dùng chọn
document.getElementById("reviewMedia")?.addEventListener("change", function(e) {
    let currentImgCount = selectedReviewMedia.filter(f => f.type.startsWith("image/")).length;
    let currentVidCount = selectedReviewMedia.filter(f => f.type.startsWith("video/")).length;
    let rejected = false;

    Array.from(this.files).forEach((file) => {
        if (file.type.startsWith("image/")) {
            if (currentImgCount >= 3) { rejected = true; return; }
            selectedReviewMedia.push(file);
            currentImgCount++;
        } else if (file.type.startsWith("video/")) {
            if (currentVidCount >= 2) { rejected = true; return; }
            selectedReviewMedia.push(file);
            currentVidCount++;
        }
    });

    renderMediaPreview();
    
    if (rejected) {
        showToast("Chỉ chấp nhận tối đa 3 ảnh và 2 video. Các file thừa đã bị bỏ qua.", "warning");
    }
});

window.removeReviewMedia = (index) => {
    selectedReviewMedia.splice(index, 1);
    renderMediaPreview();
};

function renderMediaPreview() {
    const previewContainer = document.getElementById("mediaPreview");
    previewContainer.innerHTML = "";
    
    let imgCount = 0;
    let vidCount = 0;

    selectedReviewMedia.forEach((file, index) => {
        if (file.type.startsWith("image/")) imgCount++;
        else vidCount++;

        const fileUrl = URL.createObjectURL(file);
        const itemDiv = document.createElement("div");
        itemDiv.className = "media-item";
        
        if (file.type.startsWith("image/")) {
            itemDiv.innerHTML = `<img src="${fileUrl}" alt="Preview"><button type="button" class="media-remove" onclick="removeReviewMedia(${index})"><i class="bi bi-x"></i></button>`;
        } else {
            itemDiv.innerHTML = `<video src="${fileUrl}" muted></video><button type="button" class="media-remove" onclick="removeReviewMedia(${index})"><i class="bi bi-x"></i></button>`;
        }
        previewContainer.appendChild(itemDiv);
    });
    
    const btn = document.getElementById("btnSubmitReview");
    if (btn) {
        const estPoints = 50 + (imgCount * 20) + (vidCount * 30);
        btn.innerText = `GỬI ĐÁNH GIÁ ĐỂ CỘNG ${estPoints} VI-POINTS`;
    }
}

window.openViewReviewModal = async (bookingId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/reviews/booking/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const review = await res.json();

        if (res.ok) {
            // Hiển thị sao
            let starsHtml = "";
            for (let i = 1; i <= 5; i++) {
                if (i <= review.rating) {
                    starsHtml += '<i class="bi bi-star-fill active"></i> ';
                } else {
                    starsHtml += '<i class="bi bi-star text-muted" style="opacity: 0.3;"></i> ';
                }
            }
            document.getElementById("viewReviewStars").innerHTML = starsHtml;
            document.getElementById("viewReviewComment").textContent = review.comment || "Không có nhận xét.";

            // Render media
            const mediaContainer = document.getElementById("viewReviewMediaContainer");
            const mediaGrid = document.getElementById("viewReviewMedia");
            mediaGrid.innerHTML = "";
            let hasMedia = false;

            if (review.images && review.images.length > 0) {
                hasMedia = true;
                review.images.forEach(imgUrl => {
                    mediaGrid.innerHTML += `<div class="media-item"><img src="${imgUrl}" alt="Review image"></div>`;
                });
            }

            if (review.videos && review.videos.length > 0) {
                hasMedia = true;
                review.videos.forEach(vidUrl => {
                    mediaGrid.innerHTML += `<div class="media-item"><video src="${vidUrl}" controls></video></div>`;
                });
            }

            if (hasMedia) {
                mediaContainer.style.display = "block";
            } else {
                mediaContainer.style.display = "none";
            }

            const modalEl = document.getElementById("viewReviewModal");
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        } else {
            showToast(review.message || "Không thể tải đánh giá!", "error");
        }
    } catch (error) {
        console.error("Lỗi lấy đánh giá:", error);
        showToast("Lỗi kết nối máy chủ!", "error");
    }
};

// Event delegation to handle clicking on media items in review media grids
document.addEventListener("click", (e) => {
    const mediaItem = e.target.closest(".review-media-grid .media-item");
    if (!mediaItem) return;

    // Do not zoom if it's the remove button in the write review media preview
    if (e.target.closest(".media-remove")) return;

    const img = mediaItem.querySelector("img");
    const video = mediaItem.querySelector("video");
    const lightboxContent = document.getElementById("lightboxContent");

    if (!lightboxContent) return;

    if (img) {
        lightboxContent.innerHTML = `<img src="${img.src}" class="img-fluid rounded shadow-lg" style="max-height: 80vh; max-width: 100%; object-fit: contain;">`;
    } else if (video) {
        lightboxContent.innerHTML = `<video src="${video.src}" class="w-100 rounded shadow-lg" style="max-height: 80vh;" controls autoplay></video>`;
    } else {
        return;
    }

    const modalEl = document.getElementById("lightboxModal");
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
});

// Clean up lightbox content when hidden (pauses video and prevents background play)
document.getElementById("lightboxModal")?.addEventListener("hidden.bs.modal", () => {
    const lightboxContent = document.getElementById("lightboxContent");
    if (lightboxContent) {
        lightboxContent.innerHTML = "";
    }
});
