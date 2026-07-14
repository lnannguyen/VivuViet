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
});
