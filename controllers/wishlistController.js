const Users = require("../models/User");
const Products = require("../models/Products");
const Wishlist = require("../models/Wishlist");

module.exports = {

    async addToWishlist(req,res) {
        const userId = req.session.userId;
        const productId = req.query.pr;

        try{
            //checking if user gave productId
            if(!productId) throw new Error("product id is required");
            //checking if user has given valid product id
            const product = await Products.findById(productId);
            if(!product){
                return res.status(400).json({ Error: "invalid product_id" })
            }
            //getting the user data of the user
            const user = await Users.findById(userId);
            //checking if wishlist alreary created for user
            let wishlist = await Wishlist.findOne({ userId: userId });
            if(!wishlist) {
                //if not already created then creating one
                wishlist = await Wishlist.create({ userId: userId });
                user.userWishlist = wishlist._id;//adding ref to user data also
                await user.save();                
            }
            //if already created then checking if that product is already added
            wishlist.products.forEach( product => {
                if( product.productId == productId ){
                    throw new Error("product already in wishlist")
                }
            });
            //pushing the product details into wishlist
            wishlist.products.push({ productId: productId, 
                title: product.title, 
                price: product.price, 
                image: product.image 
            });
            await wishlist.save();
            //sending success response and info
            res.json({ 
                product_added_to_wishlist: true,
                productId: product._id,
                title: product.title,
                price: product.price,
                image: product.image
            })
        }
        catch(err){
            //filtering id error
            if (err.name === "CastError") return res.status(400).json({Error: "product id entered is incorrect, check again"})
            console.log(err);
            //sending error response if any
            res.json({Error: err.message})
        }
    },

    async removeFromWishlist(req,res) {
        const userId = req.session.userId;
        const productId = req.query.pr;

        try{
            //checking if user gave productId
            if(!productId) throw new Error("product id is required");
            //get user wishlist and sending error if not found
            let wishlist = await Wishlist.findOne({ userId: userId });
            if(!wishlist){
                res.status(400).json({Error: "no product added to wishlist"});
            }else{
                //checking if that product is in wishlist or not
                const removedProduct = [];
                let productIndex = -1;
                for(index in wishlist.products) {
                    if( wishlist.products[index].productId == productId ){                        
                        productIndex = index;
                        removedProduct.push({
                            id: wishlist.products[index].productId,
                            title: wishlist.products[index].title,
                            price: wishlist.products[index].price,
                            image: wishlist.products[index].image
                        })                 
                    }
                };
                //if no such product found in wishlist then returning error
                if(productIndex == -1){
                    res.status(400).json({ Error: "this product is not in wishlist"});
                //else removing that product from the wishlist
                }else{
                    wishlist.products.splice(productIndex,1);
                    await wishlist.save();
                    //sending success response
                    res.json({ 
                        product_removed_from_wishlist: true,
                        product_removed: removedProduct
                    })
                }
            }
        }
        catch(err){//filtering id error
            if (err.name === "CastError") return res.status(400).json({Error: "product id entered is incorrect, check again"})
            console.log(err);
            //sending error response if any
            res.json({Error: err.message})
        }
    },

    async emptyWishlist(req,res) {
        const userId = req.session.userId;

        try {
            //get user wishlist and sending error if not found
            let wishlist = await Wishlist.findOne({ userId: userId });
            if(!wishlist) {
                res.status(400).json({Error: "no product added to wishlist"});
            }else if(wishlist.products.length == 0){
                res.status(400).json({Error: "wishlist is already empty"});
            }else{
                //making wishlist empty
                wishlist.products = [];
                await wishlist.save();
                //sending success response
                res.json({empty_wishlist_successfull: true})
            }
        }
        catch(err){
            console.log(err);
            //sending error response if any
            res.json({Error: err.message});
        }
    },

    async myWishlist(req,res) {
        const userId = req.session.userId;

        try {
            //get user wishlist and sending error if not found
            let wishlist = await Wishlist.findOne({ userId: userId });
            if(!wishlist) {
                res.status(404).json({message: "no product added to wishlist"});
            }else if(wishlist.products.length == 0){
                res.json({message: "wishlist is empty"});
            }else{
                const productsArr = [];
                wishlist.products.forEach( product => {
                    productsArr.push({
                       productId: product.productId,
                       title: product.title,
                       price: product.price,
                       image: product.image 
                    })
                })
                //sending success response and info
                res.json(productsArr);
            }
        }
        catch(err){
            console.log(err);
            //sending error response if any
            res.json({Error: err.message});
        }
    }
}