const express = require("express");
const { scrapeProducts } = require("../controllers/index");

const router = express.Router();

router.get("/ebay", scrapeProducts);

module.exports = router;
