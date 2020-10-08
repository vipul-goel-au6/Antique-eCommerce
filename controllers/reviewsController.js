const Users = require("../models/User");
const Products = require("../models/Products");
const Reviews = require("../models/Reviews")

module.exports = {

    async addReview(req,res){
        const userId = req.session.userId;
        const productId = req.query.pr;
        let rating = req.body.rating;
        const review = req.body.review || "";

        try{
            //checking if user gave productId
            if(!productId) throw new Error("product id is required");
            //checking if user has given valid rating
            if (!rating || rating < 1 || rating > 5){
                return res.status(400).json({ Error: "incorrect rating" })
            }else{
                rating = Number(rating.toFixed(1))
            }
            //checking if user has given valid product id
            const products = await Products.findById(productId);
            if(!products){
                return res.status(400).json({ Error: "invalid product_id" })
            }
            //getting the user data of the user
            const user = await Users.findById(userId);
            //finding all the reviews of the product
            let reviews = await Reviews.findOne({ productId: productId });
            if (!reviews){
                //if no previous reviews added then add the reviw
                const averageRating = Number(((products.rating + rating) / 2).toFixed(1));//for 1 decimal place
                reviews = await Reviews.create({ productId: productId,
                    title: products.title,
                    price: products.price,
                    image: productId.image, 
                    averageRating: averageRating,
                    reviews: [{ 
                        userId: userId,
                        name: user.name,
                        email: user.email, 
                        rating: rating, 
                        review: review }] 
                });
                user.reviewedProducts.push(reviews._id);
                products.rating = averageRating;
                await user.save();
                await products.save();
            }else {
                //else updating the previous review by user
                let alreadyReviewed = false;
                let totalRating = 0;
                let totalReviews = 0;
                reviews.reviews.forEach(eachreview => {
                    if (eachreview.userId == userId){
                        eachreview.rating = rating;
                        eachreview.review = review;
                        alreadyReviewed = true;
                    }
                    totalRating = Number(totalRating) + Number(eachreview.rating);
                    totalReviews = totalReviews + 1;
                })
                if (!alreadyReviewed){
                    reviews.reviews.push({ 
                        userId: userId,
                        name: user.name,
                        email: user.email, 
                        rating: rating, 
                        review: review 
                    });
                    totalRating = Number(totalRating) + Number(rating);
                    totalReviews = totalReviews + 1;
                }
                const averageRating = ((products.rating + (totalRating / totalReviews)) / 2).toFixed(1);
                reviews.averageRating = averageRating
                await reviews.save();
                products.rating = averageRating;
                await products.save();
            }
            //sending success response
            res.json({ 
                review_added_successfully: true,
                productId: products._id,
                title: products.title,
                price: products.price,
                image: products.image,
                averagerating: products.rating,
                myRating: rating,
                myReview: review
            });
        }
        catch(err){
            //filtering id error
            if (err.name === "CastError") return res.status(400).json({Error: "product id entered is incorrect, check again"})
            console.log(err);
            //sending error response
            res.json({Error: err.message});
        }
    },

    async getReviews(req,res){
        const productId = req.query.pr; 
        try{
            //checking if user gave productId
            if(!productId) throw new Error("product id is required");
            //checking if user has given valid product id
            const products = await Products.findById(productId);
            if(!products){
                return res.status(404).json({ Error: "invalid product_id" })
            }
            //finding all the reviews of the product and returning error if not found
            const review = await Reviews.findOne({ productId: productId });
            if (!review){
                res.status(404).json({ Error: "no reviews found for this product" })
            }
            //getting each review of the product and pushing in an array
            const reviews = [];
            review.reviews.forEach(eachreview => {
                reviews.push({ 
                    name: eachreview.name, 
                    email: eachreview.email, 
                    rating: eachreview.rating, 
                    review: eachreview.review 
                })
            })
            //sending success response
            res.json({
                productId: productId,
                title: review.title,
                price: review.price,
                image: review.image,
                averageRating: review.averageRating,
                reviews: reviews
            });
        }
        catch(err){
            //filtering id error
            if (err.name === "CastError") return res.status(400).json({Error: "product id entered is incorrect, check again"})
            console.log(err);
            //sending error if any
            res.json({Error: err.message});
        }
    },

    async myReviews(req,res){
        const userId = req.session.userId;
        try{
            const user = await Users.findById(userId);
            //searching all reviews by  user and returning error if not found
            if (!user.reviewedProducts){
                res.status(404).json({ Error: "you didn't gave any reviews yet"});
            }
            //getting alll the reviews and pushing into array
            const userReviews = [];
            for( eachreview of user.reviewedProducts){
                const review = await Reviews.findById(eachreview);
                review.reviews.forEach( object => {
                    if (object.userId == userId){
                        userReviews.push({
                            productId: review.productId,
                            title: review.title,
                            price: review.price,
                            image: review.image,
                            averageRating: review.averageRating,
                            myRating: object.rating,
                            myReview: object.review
                        })
                    }
                })
            }
            //sending success response with info
            res.json(userReviews);
        }
        catch(err){
            console.log(err);
            //sending error response if any
            res.json({Error: err.message});
        }
    }
}