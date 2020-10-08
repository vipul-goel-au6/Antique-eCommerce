const { Schema, model } =require('mongoose');

const CartSchema= new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"//refering user database
    },
    products: [//making array of object for products
        {
            productId: Schema.Types.ObjectId,
            title: String,
            price: Number,
            image: String,
            quantity: Number,
            totalPrice: Number
        }
    ],
    cartValue: {//total value of cart
        type: Number,
        default: 0
    },
    numberOfProducts: {//total number of products
        type: Number,
        default: 0
    } 
})

const Cart = model('Cart', CartSchema)

module.exports = Cart