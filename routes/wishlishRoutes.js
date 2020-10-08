const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();
const { addToWishlist, removeFromWishlist, emptyWishlist, myWishlist } = require("../controllers/wishlistController");

router.post("/addtowishlist", auth, addToWishlist);//add a product to wishlist
router.post("/removefromwishlist", auth, removeFromWishlist);//remove a product from wishlist
router.delete("/emptywishlist", auth, emptyWishlist);//remove all products from wishlist
router.get("/mywishlist", auth, myWishlist);//getting the products in the wishlist

module.exports = router;