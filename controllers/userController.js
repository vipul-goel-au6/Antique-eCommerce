const User = require("../models/User");
const Cart = require("../models/Cart");
const Orders = require("../models/Orders");
const Wishlist = require("../models/Wishlist");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");

//custom func to find user by email and password
const findByEmailAndPassword = async (email,password) => {
  try {
    //finding user by email
    const user = await User.findOne({ email: email});
    if (!user) throw new Error("incorrect email or password");
    //check is password is correct
    const isMatched = await compare(password, user.password);
    if (!isMatched) throw new Error("incorrect email or password");
    //returning user data
    return user;
  } catch (err) {
    //throw error if any
    throw err;
  }
};

//custom func to validate password
const validPassword = password => {
  //check if password id of minimum defined length
  if (password.length < 8 ) throw new Error("Password Minimum length should be 8 characters");
  //check if password has atleat one digit
  for( index in password ){
    if(isNaN(password[index]) && index==(password.length)-1) throw new Error("Password should contain atleast one digit");          
    if(!isNaN(password[index])) break;
  }
  //check if password has atleat one alphabet
  for( index in password ){
    if(!isNaN(password[index]) && index==(password.length)-1) throw new Error("Password should contain atleast one alphabet");
    if(isNaN(password[index])) break;
  }
  //check if password has alteast one uppercase
  for( index in password ){
    if((password[index]!=(password[index].toUpperCase()) && index==(password.length)-1)
    || (!isNaN(password[index]) && index==(password.length)-1)) throw new Error("Password should contain atleast one uppercase char");
    if(!isNaN(password[index])) continue;
    if(password[index]==(password[index].toUpperCase())) break;
  }
  //check if password has alteast one lowercase
  for( index in password ){
    if((password[index]!=(password[index].toLowerCase()) && index==(password.length)-1)
    || (!isNaN(password[index]) && index==(password.length)-1)) throw new Error("Password should contain atleast one lowercase char");
    if(!isNaN(password[index])) continue;
    if(password[index]==(password[index].toLowerCase())) break;
  }
}

//custom func to generate secret key
const SecretKey = (email, createdAt) => `${email}-${new Date(createdAt).getTime()}`;

module.exports = {  

  async registerUser(req, res) {
    //asigning const of name, email, password, phoneNumber, gender for validation
    const { name, email, password, phoneNumber, gender} = req.body;
    try {
      //check if name length is 4 or greater
      if (name.length < 4 ) throw new Error("length of name should be 4 or greater");
      //check if email has @ in it
      for( index in email ){
        if(email[index]!=='@' && index==(email.length)-1) throw new Error("invalid email, please check again");
        if(email[index]==='@') break;
      }
      //check valid password by custom func
      validPassword(password);
      //check if phoneNumber has a length of 10 digits
      if (phoneNumber.toString().length != 10 ) throw new Error("enter a valid phone number");
      //check if phoneNumber has all digits
      for( number of phoneNumber.toString()){
        if (isNaN(number)) throw new Error("enter a valid phone number");
      }
      //check if gender has only male, female or others
      if ( gender === "male" || gender === "female" || gender === "others" ){
      }else throw new Error("gender can be only male, female or others");
      //creating a new user with provided information
      const user = await User.create({ ...req.body });
      //generating email confirmation token
      await user.generateToken("confirm");
      //sending json response after completion
      res.status(200).json({ 
        confirmation_email_sent: true,
        message: "click link provided in email to register successfully"
      });
    } catch (err) {
      //filtering duplicacy error
      if (err.name === "MongoError") return res.status(400).json({Duplicacy_Error: `${email} is already registered`})
      //filtering token expiration error
      if (err.name === "ValidationError") return res.status(400).json({Validation_Error: err.message});
      //sending error message if other errors
      console.log(err.message)
      res.status(400).json({Error: err.message});
    }
  },

  async loginUser(req, res) {
    const { email, password } = req.body;
    //checking if user entered both email and password
    if (!email || !password)
      return res.status(400).json({ correct_credentials: false });
    try {
      //finding user data by email and password through custom function
      const user = await findByEmailAndPassword(email, password);
      //if user is confirmed then asigning session and sending response
      if (user.isConfirmed) {
        req.session.userId = user._id;
        return res.json({ 
          login_successfully: true, 
          name: user.name,
          email: user.email,
          phonenumber: user.phoneNumber,
          gender: user.gender,
          dob: user.dob
        });
      }
      //else returning error
      return res
        .status(403)
        .json({account_confirmed: false, email_sent: true});
    } catch (err) {
      //send error response if any
      res.json({Error: err.message});
    }
  },

  async changePassword(req, res) {
    const { email, oldPassword, newPassword } = req.body;
    //checking if user entered email, new password and old password 
    if (!email || !oldPassword || !newPassword)
      return res.status(400).json({ correct_credentials: false });
    try {
      //finding user data by email and password through custom function
      const user = await findByEmailAndPassword(email, oldPassword);
      //check valid new password by custom func
      validPassword(newPassword);
      //updating new password in database
      user.password = newPassword;
      await user.save();
      //sending success response
      return res.json({ password_changed_successfully: true });
    } catch (err) {
      //send error response if any
      res.json({Error: err.message});
    }
  },

  async deleteAccount(req, res) {
    const { email } = req.body;
    const userId = req.session.userId;
    if (!email) return res.status(400).json({ correct_credentials: false });
    try {
      const user = await User.findById(userId);
      //check if email entered is of logined user
      if (user.email !== email) return res.status(401).json({ Error: "enter your correct email id"})
      //finding user by id and deleting it
      await User.findOneAndDelete({ email: email },{useFindAndModify: false});
      //deleting user data from cart if any
      await Cart.findOneAndDelete({ userId: userId},{useFindAndModify: false});
      //deleting user data from wishlist if any
      await Wishlist.findOneAndDelete({ userId: userId},{useFindAndModify: false});
      //deleting user data from cart if any
      await Orders.findOneAndDelete({ userId: userId},{useFindAndModify: false})
      //sending success response
      return res.json({ account_deleted_successfully: true})
    } catch (err) {
      console.log(err.message);
      //send server error response if any
      res.status(500).json({ Error: "Server Error" });
    }
  },

  logout(req,res) {
    try{
      //check if user is logined
      if(req.session.userId){
        //delete the session
        req.session.destroy();
        //send success response
        res.json({ logout_successfull: true });
      }else{
        //send error response if user is not logined
        res.status(401).json({ Error: "login first"})
      }
    }
    catch(err){
      console.log(err.message);
      //send server error response if any
      res.json({ Error: "server error"})
    }
  },

  async resetPassword(req, res) {
    const resetToken = req.headers.token;
    const { password, email } = req.body;
    try {
      //searching for user with reset token
      const user = await User.findOne({ resetToken: resetToken });
      if (!user) {
        return res.status(401).json({ correct_credentials: false });
      }
      //getting secret key by custom function
      const secretKey = SecretKey(user.email, user.createdAt);
      //verify is reset token is valid
      const payload = await verify(resetToken, secretKey);
      if (payload){
        //check valid new password by custom func
        validPassword(password);
        //if valid then hash the entered password
        const hashedPassword = await hash(password, 10);
        //find user by email and update new password
        await User.findOneAndUpdate(
          { email: email},
          { $set: { resetToken: "", password: hashedPassword}},
          {useFindAndModify: false}
          );
          //send success response
        return res.json({ password_changed_successfully: true });
      }
      //send error response if token not verified
      res.status(401).json({ correct_credentials: false });
    } catch (err) {
      console.log(err);
      //send error response if any
      res.status(500).json({ Error: err.message });
    }
  }

};
