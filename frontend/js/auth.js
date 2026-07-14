const API_URL = "http://localhost:5000/api";
let currentUser = null;

// Khu vực thông báo
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `vv-toast ${type}`;

    const icon =
        type === "success"
            ? '<i class="bi bi-check-circle-fill"></i>'
            : '<i class="bi bi-exclamation-circle-fill"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Kiểm tra trạng thái đăng nhập và cập nhật giao diện
async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        currentUser = null;
        updateAuthUI(null);
        return null;
    }

    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            const user = await res.json();
            currentUser = user;
            localStorage.setItem("user", JSON.stringify(user));
            updateAuthUI(user);
            return user;
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            currentUser = null;
            updateAuthUI(null);
            return null;
        }
    } catch (error) {
        console.error("Check auth error:", error);
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
            currentUser = JSON.parse(cachedUser);
            updateAuthUI(currentUser);
            return currentUser;
        } else {
            updateAuthUI(null);
            return null;
        }
    }
}

function updateAuthUI(user) {
    const navAuthArea = document.getElementById("nav-auth-area");
    if (!navAuthArea) return;

    if (user) {
        navAuthArea.innerHTML = `
      <div class="dropdown">
        <div class="d-flex align-items-center gap-2 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">
          <img src="${user.avatar || "/assets/images/avt/pngtree-avatar-male-2-png-image_21200797.png"}" class="nav-user-avatar" alt="Avatar">
          <span class="nav-user-name d-none d-sm-inline">${user.fullname}</span>
        </div>
        <ul class="dropdown-menu dropdown-menu-end border-0 shadow-md rounded-3 mt-2">
          <li class="px-3 py-2 border-bottom border-light mb-1">
            <div class="fw-bold fs-7 text-primary-brand">${user.fullname}</div>
            <div class="fs-8 text-muted">${user.email}</div>
            <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill fs-9 mt-1 text-uppercase">${user.membership || "standard"}</span>
          </li>
          <li><a class="dropdown-item py-2 fs-7" href="/profile"><i class="bi bi-person me-2 text-primary-brand"></i>Thông tin cá nhân</a></li>
          <li><a class="dropdown-item py-2 fs-7" href="/profile?tab=wishlist"><i class="bi bi-heart me-2 text-primary-brand"></i>Yêu thích</a></li>
          <li><a class="dropdown-item py-2 fs-7" href="/profile?tab=bookings"><i class="bi bi-clock-history me-2 text-primary-brand"></i>Lịch sử đặt tour</a></li>
          <li><hr class="dropdown-divider opacity-50"></li>
          <li><a class="dropdown-item py-2 fs-7 text-danger" href="#" id="btnLogout"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</a></li>
        </ul>
      </div>
    `;

        // Gắn sự kiện đăng xuất vào nút
        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
            btnLogout.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
        }
    } else {
        navAuthArea.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <a href="/login" class="vv-login-link text-decoration-none">Login</a>
        <a href="/register" class="vv-register-btn text-decoration-none text-white">Register</a>
      </div>
    `;
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    currentUser = null;
    updateAuthUI(null);
    showToast("Đăng xuất thành công!", "success");

    // Thông báo đến các mô-đun khác rằng đã đăng xuất
    document.dispatchEvent(new CustomEvent("authChange", { detail: null }));
}

// Khởi động kiểm tra auth khi trang load xong
document.addEventListener("DOMContentLoaded", async () => {
    await checkAuth();
    document.dispatchEvent(
        new CustomEvent("authReady", { detail: currentUser }),
    );
});

// Chia sẻ ra toàn cục (global)
window.checkAuth = checkAuth;
window.showToast = showToast;
window.currentUser = () => currentUser;
