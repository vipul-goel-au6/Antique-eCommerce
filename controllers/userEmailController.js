const User = require("../models/User");
const { verify } = require("jsonwebtoken");

//custom func to generate secret key
const SecretKey = (email, createdAt) => `${email}-${new Date(createdAt).getTime()}`

module.exports = {

    async confirmEmail(req, res) {
    
        const { confirmToken } = req.params;
        try {
          //find the user having that confirm token
          const user = await User.findOne({ confirmToken:  confirmToken  });
          //if no such user found send error response
          if (!user) {
            return res.status(401).json({ correct_credentials: false });
          }
          //getting secret key by custom func
          const secretKey = SecretKey(user.email, user.createdAt);
          //verify if confirm token is valid
          const payload = await verify(confirmToken, secretKey);
          if (payload) {
            user.isConfirmed = true ;
            await user.save();
            //assigning user session for authorization
            req.session.userId = user._id;
            //sending success response
            return res.json({ 
              email_confirmed: true,
              registered_successfully: true
            });
          }
        } catch (err) {
          //if token expired then send custon error response
          if (err.name === "TokenExpiredError") {
            return res.json({ 
              confirmation_token_expired: true,
              message: "regenerate confirm token by posting your email on '/regenerate'"
            });
          }
          console.log(err.message);
          //sending error response if any
          res.json({Error: err.message});
        }
      },

      async regenerateRegisterToken(req, res) {
        const { email } = req.body;
        try{
          //checking if user entered an email
          if (!email) return res.status(400).json({ correct_credentials: false, message: "enter your email" });
          const user = await User.findOne({ email: email});
          //check if user entered his email correctly
          if (!user) return res.status(404).json({
            correct_credentials: false,
            message: "incorrect email, check again"
          })
          //generating new confirm token
          await user.generateToken("confirm");
          //sending success response
          res.status(202).json({ 
            confirmation_email_resent: true,
            message: "click link provided in email to register successfully"
          });
        } catch(err) {
          console.log(err.message);
          //sending error response if any
          res.json({Error: err.message});
        }
        
      },

      async sendForgotPasswordEmail(req, res) {
        const { email } = req.body;
        //checking if user entered an email
        if (!email) return res.status(400).json({ correct_credentials: false });
        try {
          const user = await User.findOne({ email: email });
          //check if user entered his email correctly
          if (!user) {
            return res
              .status(400)
              .json({
                correct_credentials: false,
                message: "incorrect email, check again"
              });
          }
          //generating a reset token
          await user.generateToken("reset");
          //sending success response
          res.json({ 
            reset_email_sent: true,
            message: "click link provided in 'reset password' email"
          })
        } catch (err) {
          console.log(err);
          //sending server error response if any
          res.status(500).json({ Error: "Server Error"});
        }
      },

      async resetEmailConfirmation(req, res) {
        const { resetToken } = req.params;
        try {
          //searching for user with the given reset token
          const user = await User.findOne({ resetToken: resetToken });
          //check if reset token is correct
          if (!user) {
            return res.status(401).json({ 
              correct_credentials: false,
              message: "goto '/forgot-password' and post your email"
            });
          }
          //getting secret key by custom func
          const secretKey = SecretKey(user.email, user.createdAt);
          //verify the reset token
          const payload = await verify(resetToken, secretKey);
          //if valid then send success response
          if (payload) {
            return res.json({ valid_token: true, token: resetToken, 
                message: "post with email and new password as body and token header 'token' on '/reset-password'"})
          }
        } catch (err) {
          if (err.name === "TokenExpiredError") {
            return res.json({ 
              reset_token_expired: true,
              message: "goto '/forgot-password' and post your email"
            });
          }
          //send server error response if any
          console.log(err.message);
          res.status(500).json({ Error: "Server Error" });
        }
      }
}