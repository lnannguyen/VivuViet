const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // Sử dụng cat001...
        code: { type: String },
        name: { type: String, required: true },
        slug: { type: String },
        type: { type: String },
        description: { type: String },
        image: { type: String },
        status: { type: Boolean, default: true },
    },
    { timestamps: true, _id: false },
);

module.exports = mongoose.model("Category", categorySchema);
