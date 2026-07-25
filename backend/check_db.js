const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log("=== USERS IN MONGO DB ATLAS ===");
        users.forEach(u => {
            console.log(`ID: ${u._id} | Email: ${u.email} | Name: ${u.fullname}`);
        });
        console.log("===============================");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkUsers();
