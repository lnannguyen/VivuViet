const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Review = require("./models/Review");

async function cleanMongoReviews() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vivuviet");
        console.log("Connected to MongoDB");

        const reviews = await Review.find({});
        console.log(`Found ${reviews.length} reviews in DB.`);

        const frontendDir = path.join(__dirname, "../frontend");

        for (let r of reviews) {
            let updated = false;

            if (r.images && r.images.length > 0) {
                const newImgs = r.images.filter(img => {
                    const fullP = path.join(frontendDir, img.replace(/^\//, ""));
                    return fs.existsSync(fullP);
                });
                if (newImgs.length !== r.images.length) {
                    r.images = newImgs;
                    updated = true;
                }
            }

            if (r.videos && r.videos.length > 0) {
                const newVids = r.videos.filter(vid => {
                    const fullP = path.join(frontendDir, vid.replace(/^\//, ""));
                    return fs.existsSync(fullP);
                });
                if (newVids.length !== r.videos.length) {
                    r.videos = newVids;
                    updated = true;
                }
            }

            if (updated) {
                await r.save();
                console.log(`Cleaned review ID: ${r._id}`);
            }
        }

        console.log("MongoDB reviews cleaned successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Clean error:", err);
        process.exit(1);
    }
}

cleanMongoReviews();
