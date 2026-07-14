/**
 * Chatbox VivuViet - Bộ điều khiển khung chat nổi
 * Tự khởi tạo nút chat, dng overlay UI và giả lập trả lời thông minh.
 */

document.addEventListener("DOMContentLoaded", () => {
    initChatbox();
});

function initChatbox() {
    // Kiểm tra hoặc tự tạo nút nổi lên
    let floatBtn = document.getElementById("btnZalo");
    if (!floatBtn) {
        floatBtn = document.createElement("a");
        floatBtn.href = "#";
        floatBtn.className = "floating-btn";
        floatBtn.id = "btnZalo";
        floatBtn.setAttribute("aria-label", "Zalo Support");
        floatBtn.innerHTML = '<i class="bi bi-chat-dots-fill fs-5"></i>';
        document.body.appendChild(floatBtn);
    }

    // Ngăn nút khỏi chuyển trang khi click
    floatBtn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleChatbox();
    });

    // Tự tạo và gắn khung chatbox vào body
    let chatbox = document.getElementById("vvChatbox");
    if (!chatbox) {
        chatbox = document.createElement("div");
        chatbox.className = "vv-chatbox";
        chatbox.id = "vvChatbox";
        chatbox.innerHTML = `
      <div class="vv-chatbox-header">
        <div class="d-flex align-items-center gap-2">
          <div class="vv-chat-avatar"><i class="bi bi-robot"></i></div>
          <div>
            <div class="fs-sm fw-bold">Trợ lý ảo VivuViet</div>
            <div class="vv-chat-status"><span class="vv-chat-dot"></span> Đang trực tuyến</div>
          </div>
        </div>
        <button id="closeChatBtn" aria-label="Close Chat"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="vv-chatbox-messages" id="chatboxMessages">
        <div class="vv-chat-bubble vv-chat-bubble-bot">
          <i class="bi bi-robot vv-bot-icon"></i>
          <div>Xin chào! Tôi là Trợ lý ảo VivuViet. Tôi có thể giúp gì cho hành trình khám phá Việt Nam của bạn hôm nay?</div>
        </div>
      </div>
      <form class="vv-chatbox-input" id="chatboxForm">
        <input type="text" id="chatboxInput" placeholder="Nhập câu hỏi của bạn..." autocomplete="off">
        <button type="submit"><i class="bi bi-send-fill"></i></button>
      </form>
    `;
        document.body.appendChild(chatbox);
    }

    // Gắn sự kiện đóng và gửi tin nhắn
    const closeBtn = document.getElementById("closeChatBtn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatbox.classList.remove("vv-chatbox-open");
        });
    }

    const form = document.getElementById("chatboxForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            sendChatMessage();
        });
    }
}

function toggleChatbox() {
    const chatbox = document.getElementById("vvChatbox");
    if (chatbox) {
        chatbox.classList.toggle("vv-chatbox-open");
        if (chatbox.classList.contains("vv-chatbox-open")) {
            const input = document.getElementById("chatboxInput");
            if (input) input.focus();
        }
    }
}

async function sendChatMessage() {
    const input = document.getElementById("chatboxInput");
    const msgContainer = document.getElementById("chatboxMessages");
    if (!input || !msgContainer) return;

    const text = input.value.trim();
    if (!text) return;

    // Hiển thị bubble tin nhắn của người dùng
    const userBubble = document.createElement("div");
    userBubble.className = "vv-chat-bubble vv-chat-bubble-user";
    userBubble.innerText = text;
    msgContainer.appendChild(userBubble);

    // Xóa input và cuộn xuống cuối
    input.value = "";
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Hiển thị hiệu ứng đang nhập (typing...)
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "vv-chat-bubble vv-chat-bubble-bot vv-typing";
    typingIndicator.id = "vvTypingIndicator";
    typingIndicator.innerHTML = "<span></span><span></span><span></span>";
    msgContainer.appendChild(typingIndicator);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Lấy nội dung phản hồi thông minh của bot
    const reply = getSmartReply(text);

    // Trễ một chút để tạo cảm giác tự nhiên
    setTimeout(() => {
        // Xóa hiệu ứng typing
        const loader = document.getElementById("vvTypingIndicator");
        if (loader) loader.remove();

        // Hiển thị bubble phản hồi của bot
        const botBubble = document.createElement("div");
        botBubble.className = "vv-chat-bubble vv-chat-bubble-bot";
        botBubble.innerHTML = `
      <i class="bi bi-robot vv-bot-icon"></i>
      <div>${reply}</div>
    `;
        msgContainer.appendChild(botBubble);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 1000);
}

function getSmartReply(query) {
    const q = query.toLowerCase();

    if (q.includes("xin chào") || q.includes("hello") || q.includes("hi")) {
        return "Chào bạn! Tôi có thể tư vấn cho bạn các tour Sapa, Hạ Long, Phú Quốc, Hội An hay hướng dẫn cách đặt tour, thanh toán online.";
    }
    if (
        q.includes("giá") ||
        q.includes("bao nhiêu tiền") ||
        q.includes("chi phí")
    ) {
        return "Giá các tour của VivuViet dao động từ 1.500.000đ đến 8.000.000đ tùy thời gian và dịch vụ. Bạn có thể sử dụng bộ công cụ <strong>Travel Budget Calculator</strong> ở trang chi tiết tour để ước tính tổng chi phí chính xác nhé!";
    }
    if (
        q.includes("đặt tour") ||
        q.includes("đặt vé") ||
        q.includes("booking")
    ) {
        return "Bạn chỉ cần chọn tour mong muốn, nhấn nút <strong>Đặt Tour Ngay</strong>, điền thông tin và tiến hành thanh toán trực tuyến qua ví MoMo hoặc VNPay rất tiện lợi.";
    }
    if (q.includes("thanh toán") || q.includes("momo") || q.includes("vnpay")) {
        return "Chúng tôi hỗ trợ 4 hình thức thanh toán: Chuyển khoản ngân hàng, ví điện tử VNPay QR, ví MoMo và thẻ quốc tế Visa/Mastercard.";
    }
    if (q.includes("sapa") || q.includes("lào cai")) {
        return "Tour Sapa đang có ưu đãi lớn trong chương trình Flash Sale! Bạn sẽ được trekking ngắm ruộng bậc thang và cáp treo Fansipan.";
    }
    if (q.includes("hạ long") || q.includes("quảng ninh")) {
        return "Tour Vịnh Hạ Long 2 ngày 1 đêm trên du thuyền 5 sao sang trọng hiện đang là tour hot nhất tuần này đấy!";
    }
    if (q.includes("chào") || q.includes("ơn")) {
        return "Rất hân hạnh được phục vụ bạn! Chúc bạn tìm được chuyến đi ưng ý nhất.";
    }

    return "Cảm ơn câu hỏi của bạn. Để được hỗ trợ trực tiếp nhanh nhất, bạn cũng có thể liên hệ hotline: <strong>+84 123 456 789</strong> hoặc email: <strong>hello@vivuviet.com</strong>.";
}
