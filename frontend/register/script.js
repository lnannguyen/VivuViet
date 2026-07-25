// register/script.js - Controller for Register page

document.addEventListener("DOMContentLoaded", () => {
    // Reveal page
    document.body.classList.remove("page-loading");
    document.body.classList.add("page-ready");

    // If user is already logged in, redirect to home immediately
    const token = localStorage.getItem("token");
    if (token) {
        window.location.href = "/";
        return;
    }

    // Form submission
    const registerForm = document.getElementById("pageRegisterForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const fullname = document
                .getElementById("registerFullname")
                .value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const phone = document.getElementById("registerPhone").value.trim();
            const password = document.getElementById("registerPassword").value;
            const confirmPassword = document.getElementById("registerConfirmPassword")?.value;

            if (password.length < 6) {
                showToast("Mật khẩu phải chứa ít nhất 6 ký tự!", "error");
                return;
            }

            if (confirmPassword && password !== confirmPassword) {
                showToast("Mật khẩu xác nhận không khớp với mật khẩu đã nhập!", "error");
                return;
            }

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ fullname, email, phone, password, confirmPassword }),
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));

                    showToast("Đăng ký tài khoản thành công!", "success");

                    setTimeout(() => {
                        window.location.href = "/";
                    }, 1000);
                } else {
                    showToast(
                        data.message || "Đăng ký tài khoản không thành công!",
                        "error",
                    );
                }
            } catch (error) {
                console.error("Register submit error:", error);
                showToast("Không thể kết nối đến máy chủ!", "error");
            }
        });
    }

    // Quick OAuth sự kiện demo
    const btnGoogle = document.getElementById("btnGoogleRegister");
    const btnFacebook = document.getElementById("btnFacebookRegister");

    const demoOAuth = (provider) => {
        showToast(
            `Tính năng đăng ký nhanh qua ${provider} đang được bảo trì!`,
            "error",
        );
    };

    if (btnGoogle)
        btnGoogle.addEventListener("click", () => demoOAuth("Google"));
    if (btnFacebook)
        btnFacebook.addEventListener("click", () => demoOAuth("Facebook"));
});
