const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();
const {
  loginUser,
  registerUser,
  changePassword,
  deleteAccount,
  logout,
  resetPassword
} = require("../controllers/userController");

router.post("/login", loginUser);//user login
router.post("/register", registerUser);//user register
router.post("/change-password", auth, changePassword);//if user wants to change password
router.post("/delete-account", auth, deleteAccount);//if user wants to delete account
router.post("/reset-password", resetPassword);//reset user password if the reset token is confirmed
router.delete("/logout", auth, logout)//user logout

module.exports = router;
