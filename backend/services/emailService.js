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

const sendPasswordResetOtp = async (user, otp) => {
    try {
        const t = await initTransporter();
        if (!t) return null;

        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #023047; margin: 0;">Vivu<span style="color: #E85D04;">Viet</span></h2>
          <p style="color: #64748b; font-size: 14px; margin-tổp: 5px;">Mã xác thực phục hồi mật khẩu</p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #475569; font-size: 15px;">Xin chào <strong>${user.fullname || "bạn"}</strong>,</p>
          <p style="color: #475569; font-size: 14px; margin-top: 10px;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản VivuViet (${user.email}). Đây là mã OTP của bạn:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #E85D04; margin: 20px 0; padding: 12px; background: #fff; border: 2px dashed #E85D04; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Mã OTP này có hiệu lực trong <strong>15 phút</strong>. Vui lòng không chia sẻ mã này cho ai khác.</p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
        </p>
      </div>
    `;

        const info = await t.sendMail({
            from: '"VivuViet Support" <no-reply@vivuviet.com>',
            to: user.email,
            subject: `[VivuViet] Mã OTP khôi phục mật khẩu: ${otp}`,
            html: htmlContent,
        });

        console.log("=========================================");
        console.log("[Password Reset OTP Sent]: %s", info.messageId);
        console.log("[OTP Code]: %s", otp);
        console.log("[Preview Email URL]: %s", nodemailer.getTestMessageUrl(info));
        console.log("=========================================");

        return nodemailer.getTestMessageUrl(info);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};

module.exports = {
    sendSplitBillInvoice,
    sendPasswordResetOtp,
};
