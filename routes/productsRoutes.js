const { getProducts, getSearchProducts } = require("../controllers/productsController");
const { Router } = require("express");
const router = Router();

router.get("/products", getProducts);//search products and filtering by category, price, rating, page
router.get("/search-products", getSearchProducts)//search products by a keyword

module.exports = router;