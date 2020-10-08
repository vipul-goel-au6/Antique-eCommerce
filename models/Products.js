const { Schema, model } =require('mongoose');

const ProductsSchema = new Schema({
    title: String,
    price: Number,
    category: String,
    rating: Number,
    image: String,
    description: String
})

const Products =model('products', ProductsSchema, 'products');

module.exports=Products;