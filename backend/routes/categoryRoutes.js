const express = require("express");
const router = express.Router();
const {
    getCategories,
    getDestinations,
} = require("../controllers/categoryController");

router.get("/categories", getCategories);
router.get("/destinations", getDestinations);

module.exports = router;
