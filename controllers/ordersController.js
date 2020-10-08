const Orders = require("../models/Orders");
const Cart = require("../models/Cart");
const User = require("../models/User");
const sendMail = require("../utils/generateOrderEmail");

module.exports = {

    async checkout (req,res){
        const userId = req.session.userId;

        try{
        //finding the orders of user in cart
        const cart = await Cart.findOne({ userId: userId });
        //if no cart then return error
        if(!cart || cart.products.length == 0){
            return res.status(400).json({ Error: "no products added to cart" })
        }
        //finding the user data
        const user = await User.findById(userId);
        let order//assigning a variable
        //checking if its user's first order
        if(!user.userOrders){
            order = await Orders.create({ userId: userId });//creating collection
            user.userOrders = order._id;//saving reference to user data
            user.save();
        }else {
            //if order already created then asigning it to variable
            order = await Orders.findById(user.userOrders);
        }
        //push the products in the cart
        order.orders.push({ products: cart.products, orderValue: cart.cartValue, numberOfProducts: cart.numberOfProducts, orderedOn: Date.now(), success: true })
        const responseObj = {
            order_placed: true,
            products: cart.products,
            orderValue: cart.cartValue, 
            numberOfProducts: cart.numberOfProducts, 
            orderedOn: Date.now(), 
            success: true
        }//saving the response in different object
        order.save();
        cart.products = [];//saving cart values to null
        cart.cartValue = 0;
        cart.numberOfProducts = 0;
        cart.save();
        await sendMail(user.email,responseObj);
        res.json(responseObj);//sending success response
        }
        catch(err){
            console.log(err);
            //sending error response if any
            res.json({Error: err.message});
        }
    },

    async myOrders(req,res){
        const userId = req.session.userId;

        try{
            //findind user data
            const user = await User.findById(userId);
            //checking if there are any orders of user
            if (!user.userOrders){
                res.status(404).json({ Error: "no orders found" });
            }
            //finding orders of user
            const orders = await Orders.findById(user.userOrders);
            const myOrders = [];//assigning empty array variables
            let myOrderProducts = [];
            orders.orders.forEach( order => {
                order.products.forEach( products => {
                    myOrderProducts.push({//getting products of each order
                        productId: products.productId,
                        title: products.title,
                        price: products.price,
                        image: products.image,
                        quantity: products.quantity,
                        totalPrice: `${products.quantity} * ${products.price} = ${products.totalPrice}`                        
                    })
                })
                myOrders.push({//getting each order
                    orderedProducts: myOrderProducts,
                    orderValue: order.orderValue,
                    numberOfProducts: order.numberOfProducts,
                    orderedOn: order.orderedOn,
                    success: order.success
                })
                myOrderProducts = [];
            })
            //sending success response
            res.json(myOrders);
        }
        catch(err){
            console.log(err.message);
            //sending error response if any
            res.json({Error: err.message});
        }
    }

}