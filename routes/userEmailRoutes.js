const { Router } = require("express");
const router = Router();
const {
    confirmEmail, 
    regenerateRegisterToken, 
    sendForgotPasswordEmail, 
    resetEmailConfirmation} = require("../controllers/userEmailController");

// get routes
router.get("/confirm/:confirmToken", confirmEmail);//when user clicks link in "confirm email" mail
router.get("/reset/:resetToken", resetEmailConfirmation);//when user clicks link in "reset password" mail

// post routes
router.post("/regenerate", regenerateRegisterToken);//if user requests to regenerate "confirm email" mail
router.post("/forgot-password", sendForgotPasswordEmail);//if user requests to reset the password

module.exports = router