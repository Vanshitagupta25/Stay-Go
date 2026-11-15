const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const { sendResponse } = require("../utils/responseHandler");

router.route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.userSignup));

router.route("/login")
  .get(userController.renderLoginForm)
  .post(saveRedirectUrl, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return sendResponse(req, res, {
          statusCode: 401,
          message: info?.message || "Invalid username or password",
          redirectUrl: "/login",
        });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        return userController.userLogin(req, res);
      });
    })(req, res, next);
  });

const User = require("../models/user.js");

router.get("/logout", userController.userLogout);

router.get("/curr-user", wrapAsync(async (req, res) => {
  let user = null;
  if (req.isAuthenticated()) {
    user = await User.findById(req.user._id);
    if (user) {
      user.lastActive = new Date();
      await user.save();
    }
  }
  return sendResponse(req, res, {
    statusCode: 200,
    data: { user },
  });
}));

const { getUserBookings } = require("../controllers/payment.js");
const { isLoggedIn } = require("../middleware.js");

router.post("/wishlist/:listingId", wrapAsync(userController.toggleWishlist));
router.get("/wishlist", wrapAsync(userController.getWishlist));
router.get("/my-bookings", isLoggedIn, wrapAsync(getUserBookings));
router.get("/bookings", isLoggedIn, wrapAsync(getUserBookings));

module.exports = router;