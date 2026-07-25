// Tìm kiếm tour trên thanh nav với debounce 300ms
// Tự khởi tạo khi DOM sẵn sàng - tìm #navSearchInput và hiển thị dropdown kết quả bên dưới.

(function () {
    function initSearch() {
        const input = document.getElementById("navSearchInput");
        if (!input) return; // Trang không có navbar search thì bỏ qua

        // Tạo dropdown kết quả
        const resultsBox = document.createElement("div");
        resultsBox.id = "vv-search-results";
        resultsBox.className = "vv-search-dropdown";

        // Bọc input trong position:relative container
        const wrapper = input.parentElement;
        wrapper.style.position = "relative";
        wrapper.appendChild(resultsBox);

        let debounceTimer = null;

        input.addEventListener("input", () => {
            const keyword = input.value.trim();
            clearTimeout(debounceTimer);

            if (keyword.length === 0) {
                hideResults();
                return;
            }

            debounceTimer = setTimeout(() => searchTours(keyword), 300);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && input.value.trim()) {
                e.preventDefault();
                window.location.href = `/tours?keyword=${encodeURIComponent(input.value.trim())}`;
            }
        });

        // Bấm ra ngoài thì ẩn dropdown
        document.addEventListener("click", (e) => {
            if (
                !e.target.closest("#navSearchInput") &&
                !e.target.closest("#vv-search-results")
            ) {
                hideResults();
            }
        });

        function hideResults() {
            resultsBox.innerHTML = "";
            resultsBox.classList.remove("show");
        }

        async function searchTours(keyword) {
            try {
                resultsBox.innerHTML = `
          <div class="vv-search-loading">
            <div class="spinner-border spinner-border-sm text-success" role="status"></div>
            <span>Đang tìm kiếm...</span>
          </div>`;
                resultsBox.classList.add("show");

                const res = await fetch(
                    `${API_URL}/tours?keyword=${encodeURIComponent(keyword)}&limit=6`,
                );
                if (!res.ok) throw new Error("API error");
                const data = await res.json();
                renderResults(data.tours || []);
            } catch (err) {
                resultsBox.innerHTML = `<div class="vv-search-empty"><i class="bi bi-exclamation-circle"></i> Có lỗi khi tìm kiếm.</div>`;
            }
        }

        function renderResults(tours) {
            if (!tours.length) {
                resultsBox.innerHTML = `<div class="vv-search-empty"><i class="bi bi-search"></i> Không tìm thấy tour phù hợp.</div>`;
                return;
            }

            resultsBox.innerHTML =
                tours
                    .map(
                        (t) => `
        <a href="/tours/${t.slug || t._id}" class="vv-search-item">
          <img src="${t.image || t.thumbnail || "/assets/images/categories/dulichbien.png"}" 
               alt="${escapeHtml(t.title || t.name)}" 
               onerror="this.src='/assets/images/categories/dulichbien.png'" />
          <div class="vv-search-item-info">
            <div class="vv-search-item-name">${escapeHtml(t.title || t.name)}</div>
            <div class="vv-search-item-meta">
              <span><i class="bi bi-geo-alt-fill"></i> ${escapeHtml(t.destination || "")}</span>
              <span class="vv-search-item-price">${formatVND(t.price)}</span>
            </div>
          </div>
        </a>
      `,
                    )
                    .join("") +
                `
        <a href="/tours?keyword=${encodeURIComponent(input.value.trim())}" class="vv-search-view-all">
          <i class="bi bi-search"></i> Xem tất cả kết quả
        </a>`;
        }

        function escapeHtml(str) {
            return (str || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        function formatVND(price) {
            if (!price) return "";
            return price.toLocaleString("vi-VN") + " đ";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSearch);
    } else {
        initSearch();
    }
})();
