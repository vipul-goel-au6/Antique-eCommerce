const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();
const { addReview, getReviews, myReviews } = require("../controllers/reviewsController");

router.post("/addreview", auth, addReview);//add review for any product
router.post("/getreviews", auth, getReviews);//get reviews for any product
router.get("/myreviews", auth, myReviews);//get all the user reviews

module.exports = router;