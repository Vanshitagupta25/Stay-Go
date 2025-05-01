const User = require("../models/user.js");


module.exports.renderSignupForm = (req,res) => {
  res.render("signup.ejs");
};

module.exports.userSignup = async(req,res) => {
  try {
    let {username , email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser , password);
    console.log(registeredUser);
    req.login(registeredUser , (err) => {
      if(err) {
        return next(err);
       }
       req.flash("info" , "Welcome to Wanderlust");
       res.redirect("/listings");
    
    });
  } catch(e) {
    req.flash("error" , e.message);
    res.redirect("/signup");

  }};

  module.exports.renderLoginForm = (req,res) => {
    res.render("login.ejs");
  }

  module.exports.userLogin = async(req,res) => {
  {
    req.flash("info" , "welcome to Wanderlust");
    let redirect = res.locals.redirectUrl || "/listings";
    res.redirect(redirect);
  }
};

  module.exports.userLogout =  (req,res,next) => {
    req.logout((err) => {
      if(err) {
       return next(err);
      }
      req.flash("info", "you are logged out!");
      res.redirect("/listings");
    })
  };