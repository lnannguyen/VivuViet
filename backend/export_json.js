const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function exportAllData() {
    try {
        console.log("Đang kết nối tới MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Kết nối MongoDB thành công!");

        const backupDir = path.join(__dirname, "backup");
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n[Backup] Tim thấy ${collections.length} bang du lieu trong Database. Dang xuat ra file JSON...\n`);

        for (const col of collections) {
            const data = await mongoose.connection.db.collection(col.name).find({}).toArray();
            const filePath = path.join(backupDir, `${col.name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
            console.log(` [OK] Da xuat ${data.length} ban ghi ra file: backend/backup/${col.name}.json`);
        }

        console.log("\n=========================================");
        console.log("[XUAT TOAN BO FILE BACKUP JSON THANH CONG]");
        console.log(` Thu muc luu truh: ${backupDir}`);
        console.log("=========================================\n");

        process.exit(0);
    } catch (err) {
        console.error("Lỗi khi xuất dữ liệu ra JSON:", err);
        process.exit(1);
    }
}

exportAllData();
