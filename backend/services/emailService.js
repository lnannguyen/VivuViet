const nodemailer = require("nodemailer");

let dynamicTransporter = null;

const initTransporter = async () => {
    if (dynamicTransporter) return dynamicTransporter;
    try {
        let testAccount = await nodemailer.createTestAccount();
        dynamicTransporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        console.log("Ethereal Email initialized: %s", testAccount.user);
        return dynamicTransporter;
    } catch (error) {
        console.error("Failed to init Ethereal:", error);
        return null;
    }
};

const sendSplitBillInvoice = async (booking, user, tour) => {
    try {
        const t = await initTransporter();
        if (!t) return null;

        // Prepare HTML content
        const splitRows = booking.bill_split
            .map(
                (split) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${split.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #E85D04;">${split.amount.toLocaleString("vi-VN")} đ</td>
      </tr>
    `,
            )
            .join("");

        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #023047; text-align: center;">HÓA ĐƠN ĐẶT TOUR - VIVUVIET</h2>
        <p>Xin chào <strong>${user.fullname}</strong>,</p>
        <p>Cảm ơn bạn đã đặt chuyến đi <strong>${tour.title || tour.name}</strong> qua hệ thống VivuViet.</p>
        <p>Dưới đây là chi tiết sao kê chia tiền (Split Bill) cho nhóm của bạn:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Thành viên</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Số tiền cần thanh toán</th>
            </tr>
          </thead>
          <tbody>
            ${splitRows}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; text-align: left; font-weight: bold;">Tổng cộng:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: #E85D04; font-size: 18px;">${booking.final_price.toLocaleString("vi-VN")} đ</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
          Vui lòng chuyển tiền cho trưởng nhóm theo số tiền trên để hoàn tất!
        </p>
      </div>
    `;

        const info = await t.sendMail({
            from: '"VivuViet Booking" <no-reply@vivuviet.com>',
            to: user.email,
            subject: `Hóa đơn chia tiền tour: ${tour.title || tour.name}`,
            html: htmlContent,
        });

        console.log("=========================================");
        console.log("[Email] Message sent: %s", info.messageId);
        console.log("[Preview URL]: %s", nodemailer.getTestMessageUrl(info));
        console.log("=========================================");

        return nodemailer.getTestMessageUrl(info);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = {
    sendSplitBillInvoice,
};
