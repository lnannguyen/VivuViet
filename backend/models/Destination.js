const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // Sử dụng des001...
        code: { type: String },
        name: { type: String, required: true },
        description: { type: String },
        image: { type: String },
        badge: { type: String },
        status: { type: Boolean, default: true },
    },
    { timestamps: true, _id: false },
);

module.exports = mongoose.model("Destination", destinationSchema);
