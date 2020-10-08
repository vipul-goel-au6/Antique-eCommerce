const { addToCart, removeFromCart, emptyCart, myCart } = require("../controllers/cartController");
const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();

router.post("/addtocart", auth, addToCart);//for adding a product to cart with 1 or more quantity
router.post("/removefromcart", auth, removeFromCart);//for removing a product to cart with 1 or more quantity
router.delete("/emptycart", auth, emptyCart);//removing all the products from cart
router.get("/mycart", auth, myCart);//getting all the products from the cart

module.exports = router;