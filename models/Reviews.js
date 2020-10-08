const { Schema, model } =require('mongoose');

const ReviewsSchema= new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "products"//refering products database
    },
    title: String,
    price: Number,
    image: String,
    averageRating: {//type decimal
        type: Schema.Types.Decimal128,
        default: 0
    },
    reviews: [//making array of object for reviews
        {
            userId: Schema.Types.ObjectId,
            name: String,
            email: String,
            rating: Schema.Types.Decimal128,
            review: String            
        }
    ]
})

const Reviews = model('Reviews', ReviewsSchema)
module.exports = Reviews;