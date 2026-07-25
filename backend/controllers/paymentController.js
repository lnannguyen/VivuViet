const crypto = require("crypto");
const moment = require("moment");
const Booking = require("../models/Booking");

const createPaymentUrl = async (req, res) => {
    try {
        const { booking_id } = req.body;

        const booking = await Booking.findById(booking_id);
        if (!booking)
            return res.status(404).json({ message: "Không tìm thấy booking!" });

        const date = new Date();
        const createDate = moment(date).format("YYYYMMDDHHmmss");
        const orderId = booking_id;

        const tmnCode = process.env.VNPAY_TMN_CODE;
        const secretKey = process.env.VNPAY_HASH_SECRET;
        const vnpUrl = process.env.VNPAY_URL;
        const returnUrl = process.env.VNPAY_RETURN_URL;
        const amount = (booking.final_price || booking.total_price) * 100;

        let vnpParams = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: tmnCode,
            vnp_Amount: amount,
            vnp_CreateDate: createDate,
            vnp_CurrCode: "VND",
            vnp_IpAddr: req.ip || "127.0.0.1",
            vnp_Locale: "vn",
            vnp_OrderInfo: `Thanh toan booking ${booking_id}`,
            vnp_OrderType: "other",
            vnp_ReturnUrl: returnUrl,
            vnp_TxnRef: orderId,
        };

        // Sắp xếp params
        vnpParams = sortObject(vnpParams);

        const signData = new URLSearchParams(vnpParams).toString();
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");
        vnpParams["vnp_SecureHash"] = signed;

        const paymentUrl =
            vnpUrl + "?" + new URLSearchParams(vnpParams).toString();

        res.status(200).json({ paymentUrl });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server!", error });
    }
};

const vnpayReturn = async (req, res) => {
    try {
        const vnpParams = req.query;
        const secureHash = vnpParams["vnp_SecureHash"];

        delete vnpParams["vnp_SecureHash"];
        delete vnpParams["vnp_SecureHashType"];

        const secretKey = process.env.VNPAY_HASH_SECRET;
        const sortedParams = sortObject(vnpParams);
        const signData = new URLSearchParams(sortedParams).toString();
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        const clientOrigin = process.env.CLIENT_URL || "http://localhost:5000";

        if (secureHash === signed && vnpParams["vnp_ResponseCode"] === "00") {
            const bookingId = vnpParams["vnp_TxnRef"];
            if (bookingId) {
                await Booking.findByIdAndUpdate(bookingId, {
                    booking_status: "paid",
                    payment_method: "vnpay",
                });
            }
            res.redirect(
                `${clientOrigin}/booking/success?payment_method=vnpay`,
            );
        } else {
            res.redirect(`${clientOrigin}/booking/failed`);
        }
    } catch (error) {
        console.error("VNPAY Return error:", error);
        res.redirect(`${clientOrigin}/booking/failed`);
    }
};

function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}

module.exports = { createPaymentUrl, vnpayReturn };
