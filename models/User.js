const sendMail = require("../utils/generateEmail");
const { hash } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { Schema, model } =require('mongoose')

const UsersSchema= new Schema({
  name: {
    type : String,
    required:true,
    trim:true
  },

  email:{
    type : String,
    required:true,
    trim:true,
    unique:true
  },

  password:{
    type : String,
    required:true,
    trim:true
  },

  phoneNumber :{
    type: Number,
    required:true
  },

  dob:{
    type: Date,
    required:true
  },

  gender:{
    type:String
  },

  isConfirmed: {
    type: Boolean,
    required: true,
    default: false
  },

  confirmToken: {
    type: String,
    default: ""
  },

  resetToken: {
    type: String,
    default: ""
  },

  userCart: {
    type: Schema.Types.ObjectId,
    ref: "Cart"//refering cart database
  },

  userWishlist: {
    type: Schema.Types.ObjectId,
    ref: "Wishlist"//refering wishlist database
  },

  userOrders: {
    type: Schema.Types.ObjectId,
    ref: "Orders"//refering orders database
  },

  reviewedProducts: [
    {
    type: Schema.Types.ObjectId,
    ref: "Reviews"//refering reviews database
    }
  ]
  }
  ,
  {timestamps:true}
);

//method func for generating a confirm token
UsersSchema.methods.generateToken = async function(mode){
  //generating a secret key
  const secretKey = `${this.email}-${new Date(
    this.createdAt)
  .getTime()}`;
  //generating a token by jwt
  const token = await sign(
    { id: this._id },
    secretKey,
    { expiresIn: "30000000" }
  );
  //checking if it is confirm or reset token
  if (mode === "confirm") {
    this.confirmToken = token;
  } else if (mode === "reset") {
    this.resetToken = token
  }
  //saving token in user database
  await this.save();
  //sending email through a custom func
  await sendMail(mode, this.email, token);
}

//a pre method to hash password and save in user database
UsersSchema.pre("save",async function(next) {
  try{
    const user = this;
    if (user.isModified("password")) {
      const hashedPassword = await hash(user.password, 10);
      user.password = hashedPassword;
      next();
    }
  } 
  catch(err) {
      next(err);
  };
});

const Users =model('Users',UsersSchema)

module.exports=Users
