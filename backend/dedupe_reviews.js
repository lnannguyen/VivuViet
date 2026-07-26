const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Review = require("./models/Review");

async function dedupeReviews() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas!");

        const allReviews = await Review.find({}).sort({ createdAt: -1 });
        console.log(`Total reviews in DB before deduplication: ${allReviews.length}`);

        const seen = new Set();
        const toDeleteIds = [];
        const uniqueReviews = [];

        for (let r of allReviews) {
            // Key based on user_id, tour_id/booking_id, comment
            const uId = r.user_id ? r.user_id.toString() : "";
            const bId = r.booking_id ? r.booking_id.toString() : "";
            const tId = r.tour_id ? r.tour_id.toString() : "";
            const cmt = (r.comment || "").trim();

            const key = `${uId}_${bId || tId}_${cmt}`;

            if (seen.has(key)) {
                toDeleteIds.push(r._id);
            } else {
                seen.add(key);
                uniqueReviews.push(r);
            }
        }

        if (toDeleteIds.length > 0) {
            console.log(`Found ${toDeleteIds.length} duplicate reviews to delete:`, toDeleteIds);
            await Review.deleteMany({ _id: { $in: toDeleteIds } });
            console.log("Deleted duplicates successfully!");
        } else {
            console.log("No duplicate reviews found in DB.");
        }

        // Re-query clean list and export backup JSON
        const cleanReviews = await Review.find({});
        console.log(`Final clean review count: ${cleanReviews.length}`);

        const backupPath = path.join(__dirname, "backup/reviews.json");
        fs.writeFileSync(backupPath, JSON.stringify(cleanReviews, null, 2), "utf-8");
        console.log(`Exported clean backup to ${backupPath}`);

        process.exit(0);
    } catch (err) {
        console.error("Dedupe error:", err);
        process.exit(1);
    }
}

dedupeReviews();
