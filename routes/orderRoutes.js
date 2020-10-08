const { checkout, myOrders} = require("../controllers/ordersController");
const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();

router.get("/checkout", auth, checkout);//placing order for all products in cart
router.get("/myorders", auth, myOrders);//getting all orders until now

module.exports = router;