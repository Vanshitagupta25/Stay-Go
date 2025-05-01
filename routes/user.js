const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");


// signup route
router.get("/signup" , (req,res) => {
  res.render("signup.ejs");
});
router.post("/signup" , wrapAsync(userController.userSignup));

// login route
router.get("/login" , userController.renderLoginForm);

router.post("/login" , 
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login" ,
     failureFlash: true
    }),
    userController.userLogin
  );
// logout route
router.get("/logout" , userController.userLogout);

module.exports = router;