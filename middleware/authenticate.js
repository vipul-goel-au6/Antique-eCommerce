var User = require("../models/User");//model of user database

module.exports = async (req, res, next) => {
  try {
    //checking if user has logined
    if (req.session.userId) {
      //checking if id is valid
      const user = await User.findById(req.session.userId);
      if (!user) return res.json({ correct_credentials: false });
      return next();
    }
    return res.json({ authorised_access: false});
  } catch (err) {
    console.log(err.message);
    //sending server error if any
    res.json({ Error: "Server Error" });
  }
};