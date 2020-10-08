const Users = require("../models/User");
const Products = require("../models/Products");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");

module.exports = {

    async addToCart(req,res){
        //assigning variables of userId and data from user
        const userId = req.session.userId;
        const productId = req.query.pr;
        const quantity = req.query.qu || 1;
        let cartValue = 0;//assigning empty variables
        let totalProducts = 0;

        try{
            //checking if user gave productId
            if(!productId) throw new Error("product id is required");
            //finding the product user wants to add to cart
            const products = await Products.findById(productId);
            //if no product found then sending error response
            if(!products){
                return res.status(404).json({ Error: "invalid product_id" })
            }
            //finding user data by userId
            const user = await Users.findById(userId);
            let cart = await Cart.findOne({ userId: userId });
            const wishlist = await Wishlist.findOne({ userId: userId });
            //checking if the product is there in wishlist too and deleting it
            if(wishlist) {
                for(productIndex in wishlist.products) {
                    if( wishlist.products[productIndex].productId == productId ){                        
                        wishlist.products.splice(productIndex,1);
                        await wishlist.save();                    
                    }
                };
            }
            //create a cart if no cart is there initially
            if(!cart) {
                cartValue = products.price * quantity;//calculating totalPrice
                cart = await Cart.create({ userId: userId });
                cart.products.push({productId: productId,//pushing product details with quantity and price
                    title: products.title,
                    price: products.price,
                    image: products.image,
                    quantity: quantity, 
                    totalPrice: products.price * quantity 
                });
                cart.numberOfProducts = quantity;//pushing number of products
                cart.cartValue = cart.cartValue + cartValue;
                await cart.save();
                user.userCart = cart._id;//assigning cartId in user model
                await user.save();                
            }else{
                let quantityModified = false
                cart.products.forEach( product => {//if same product is added to cart then increasing the quantity
                    if( product.productId == productId ){
                        product.quantity = Number(product.quantity) + Number(quantity);
                        product.totalPrice = product.quantity * products.price;
                        quantityModified = true;
                    }
                    totalProducts = Number(totalProducts) + Number(product.quantity)
                    cartValue = Number(cartValue) + Number(product.totalPrice)
                });
                if(!quantityModified) {//pushing object into cart
                    cart.products.push({productId: productId,
                        title: products.title,
                        price: products.price,
                        image: products.image,
                        quantity: quantity, 
                        totalPrice: products.price * quantity 
                    });
                    totalProducts = totalProducts + Number(quantity)
                    cartValue = cartValue + Number(products.price) * quantity;
                }
                //updating total products and cartValue
                cart.numberOfProducts = totalProducts;
                cart.cartValue = cartValue;
                await cart.save();
            }
            //sensing success response
            res.json({ 
                product_added_to_cart: true,
                productId: products._id,
                title: products.title,
                price: products.price,
                image: products.image,
                quantity: quantity, 
                totalPrice: products.price * quantity
            });
        }
        catch(err){
            //filtering id error
            if (err.name === "CastError") return res.status(400).json({Error: "product id entered is incorrect, check again"})
            console.log(err);
            //sending error response if any
            res.json({Error: err.message});
        }
    },

    async removeFromCart(req,res){
        const userId = req.session.userId;
        const productId = req.query.pr;
        const quantity = req.query.qu || 1;
        let cartValue = 0;
        let totalProducts = 0;

        try{
            //checking if user gave productId
            if(!productId) throw new Error("product id is required");
            //finding the product user wants to add to cart
            const products = await Products.findById(productId);
            //if no product found then sending error response
            if(!products){
                return res.status(404).json({ Error: "invalid product_id" })
            }
            //finding user cart and returning error if not found
            let cart = await Cart.findOne({ userId: userId });
            if(!cart){
                res.status(400).json({Error: "cart not created"});
            }else{
                let check = 0;//to check if user is decresing quantity
                for(productIndex in cart.products) {
                    //to check if user added this product in cart
                    if( productIndex == cart.products.length-1 &&
                        cart.products[productIndex].productId != productId && check == 0){
                            throw new Error("this product was not added to cart")
                        }
                    if( cart.products[productIndex].productId == productId ){
                        //if products in the cart are less than quantity given
                        if(quantity > cart.products[productIndex].quantity){
                            throw new Error("cannot remove products more than in the cart itself")
                        //if products in cart are same as quantity given then remove that
                        }else if(quantity == cart.products[productIndex].quantity){
                            cart.products.splice(productIndex,1);
                        //else decrease the quantity of products in cart
                        }else {
                            cart.products[productIndex].quantity = Number(cart.products[productIndex].quantity) - Number(quantity);
                            cart.products[productIndex].totalPrice = cart.products[productIndex].quantity * products.price;
                            check = 1;
                        }
                    }
                    //calculating total products and cartvalue
                    totalProducts = Number(totalProducts) + Number(cart.products[productIndex].quantity);
                    cartValue = Number(cartValue) + Number(cart.products[productIndex].totalPrice);

                };
                cart.numberOfProducts = totalProducts
                cart.cartValue = cartValue;
                //saving changes and returning success response
                await cart.save();
                res.json({ product_removed_from_cart: true})
            }
        }
        catch(err){
            //filtering id error
            if (err.name === "CastError") return res.status(400).json({Error: "product id entered is incorrect, check again"})
            console.log(err);
            //sending error response if any
            res.json({Error: err.message})
        }
    },

    async emptyCart(req,res) {
        const userId = req.session.userId;

        try {
            //find user cart by userId and return error if not found
            let cart = await Cart.findOne({ userId: userId });
            if(!cart) {
                res.status(404).json({Error: "cart not created"});
            }else if(cart.products.length == 0){
                res.status(404).json({message: "cart already empty"});
            }else{
                //empty all cart and send response
                cart.products = [];
                cart.numberOfProducts = 0;
                cart.cartValue = 0;
                await cart.save();
                res.json({empty_cart_successfull: true})
            }
        }
        catch(err){
            console.log(err);
            //sending error response if any
            res.json({Error: err.message});
        }
    },

    async myCart(req,res) {
        const userId = req.session.userId;

        try {
            //find user cart by userId and return error if not found
            let cart = await Cart.findOne({ userId: userId });
            if(!cart) {
                res.status(400).json({Error: "cart not created"});
            }else if(cart.products.length == 0){
                res.status(400).json({Error: "cart is empty"});
            }else{
                //getting product details from product table
                const cartProducts = [];
                cart.products.forEach( product => {
                    cartProducts.push({
                        productId: product.productId,
                        title: product.title,
                        price: product.price,
                        image: product.image,
                        quantity: product.quantity,
                        totalPrice: product.totalPrice
                    })
                })
                //returning success response with required info
                res.json({
                    cartValue: cart.cartValue,
                    numberOfProducts: cart.numberOfProducts,
                    products: cartProducts
                })
            }
        }
        catch(err) {
            console.log(err);
            //returning error response if any
            res.json({Error: err.message});
        }
    }
    
}