// login/script.js - Controller for Login page

document.addEventListener("DOMContentLoaded", () => {
    // Reveal page
    document.body.classList.remove("page-loading");
    document.body.classList.add("page-ready");

    // If user is already logged in, redirect to home or profile immediately
    const token = localStorage.getItem("token");
    if (token) {
        window.location.href = "/";
        return;
    }

    // Form submission
    const loginForm = document.getElementById("pageLoginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));

                    showToast("Đăng nhập thành công!", "success");

                    // Wait briefly for the toast to show, then redirect
                    setTimeout(() => {
                        // Determine where to redirect: check document.referrer, fallback to home
                        const referrer = document.referrer;
                        if (
                            referrer &&
                            referrer.includes(window.location.host) &&
                            !referrer.includes("/login") &&
                            !referrer.includes("/register")
                        ) {
                            window.location.href = referrer;
                        } else {
                            window.location.href = "/";
                        }
                    }, 1000);
                } else {
                    showToast(
                        data.message || "Mật khẩu hoặc email không chính xác!",
                        "error",
                    );
                }
            } catch (error) {
                console.error("Login submit error:", error);
                showToast("Không thể kết nối đến máy chủ!", "error");
            }
        });
    }

    // Quick OAuth sự kiện demo
    const btnGoogle = document.getElementById("btnGoogleLogin");
    const btnFacebook = document.getElementById("btnFacebookLogin");

    const demoOAuth = (provider) => {
        showToast(
            `Tính năng đăng nhập nhanh qua ${provider} đang được bảo trì!`,
            "error",
        );
    };

    if (btnGoogle)
        btnGoogle.addEventListener("click", () => demoOAuth("Google"));
    if (btnFacebook)
        btnFacebook.addEventListener("click", () => demoOAuth("Facebook"));

    // ----------------------------------------------------
    // Xử lý Quên mật khẩu & Đặt lại mật khẩu bằng OTP
    // ----------------------------------------------------
    const formSendOtp = document.getElementById("formSendOtp");
    const formResetPassword = document.getElementById("formResetPassword");
    let resetTargetEmail = "";

    if (formSendOtp) {
        formSendOtp.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("forgotEmail").value.trim();
            const btnSubmit = document.getElementById("btnSubmitSendOtp");

            if (!email) return;

            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Đang gửi OTP...';

            try {
                const res = await fetch(`${API_URL}/auth/forgot-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                const data = await res.json();
                if (res.ok) {
                    resetTargetEmail = email;
                    showToast(data.message, "success");

                    // Chuyển từ Form Nhập Email sang Form Nhập OTP & Mật Khẩu Mới
                    formSendOtp.classList.add("d-none");
                    formResetPassword.classList.remove("d-none");

                    // Tự động điền mã OTP nếu trả về hỗ trợ test nhanh
                    if (data.otp) {
                        document.getElementById("resetOtp").value = data.otp;
                        document.getElementById("otpNotice").innerHTML =
                            `<i class="bi bi-check-circle-fill me-1"></i> Mã OTP đã gửi: <strong class="text-accent fs-6 ms-1">${data.otp}</strong> (Có hiệu lực 15 phút)`;
                    }
                } else {
                    showToast(data.message || "Không thể gửi OTP!", "error");
                }
            } catch (error) {
                console.error("Send OTP error:", error);
                showToast("Lỗi kết nối máy chủ!", "error");
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="bi bi-send-fill me-2"></i>Gửi mã xác thực OTP';
            }
        });
    }

    if (formResetPassword) {
        formResetPassword.addEventListener("submit", async (e) => {
            e.preventDefault();
            const otp = document.getElementById("resetOtp").value.trim();
            const newPassword = document.getElementById("resetNewPassword").value;
            const btnSubmit = document.getElementById("btnSubmitResetPass");

            if (!otp || !newPassword) return;

            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Đang xử lý...';

            try {
                const res = await fetch(`${API_URL}/auth/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: resetTargetEmail,
                        otp: otp,
                        newPassword: newPassword,
                    }),
                });

                const data = await res.json();
                if (res.ok) {
                    showToast("Đặt lại mật khẩu thành công! Hãy đăng nhập.", "success");

                    // Điền tự động mật khẩu mới vào ô Đăng nhập
                    document.getElementById("loginEmail").value = resetTargetEmail;
                    document.getElementById("loginPassword").value = newPassword;

                    // Đóng modal
                    const modalEl = document.getElementById("forgotPasswordModal");
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) modalInstance.hide();

                    // Reset form modal về ban đầu
                    formSendOtp.classList.remove("d-none");
                    formResetPassword.classList.add("d-none");
                    formSendOtp.reset();
                    formResetPassword.reset();
                } else {
                    showToast(data.message || "Xác nhận OTP thất bại!", "error");
                }
            } catch (error) {
                console.error("Reset password error:", error);
                showToast("Lỗi kết nối máy chủ!", "error");
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="bi bi-shield-check me-2"></i>Xác nhận đặt lại Mật khẩu';
            }
        });
    }
});
