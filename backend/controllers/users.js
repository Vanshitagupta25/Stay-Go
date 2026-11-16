const User = require("../models/user.js");
const { sendResponse } = require("../utils/responseHandler");

const toSafeUser = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.hash;
  delete obj.salt;
  return obj;
};

module.exports.renderSignupForm = (req, res) => {
  res.render("signup.ejs");
};

module.exports.userSignup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    if (!username || !email || !password) {
      return sendResponse(req, res, {
        statusCode: 400,
        message: "Username, email and password are required",
        redirectUrl: "/signup",
      });
    }

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        return sendResponse(req, res, {
          statusCode: 200,
          message: "Welcome to Stay-Go",
          data: { user: toSafeUser(registeredUser) },
          redirectUrl: "/listings",
        });
      });
    });
  } catch (e) {
    const statusCode = e?.name === "UserExistsError" ? 409 : 400;
    return sendResponse(req, res, {
      statusCode,
      message: e.message,
      redirectUrl: "/signup",
    });
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("login.ejs");
};

module.exports.userLogin = async (req, res, next) => {
  try {
    let redirectUrl = res.locals.redirectUrl || "/listings";
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });
      req.user.lastActive = new Date();
    }
    req.session.save((err) => {
      if (err) return next(err);
      return sendResponse(req, res, {
        statusCode: 200,
        message: "Welcome back to Stay-Go",
        data: { user: toSafeUser(req.user) },
        redirectUrl,
      });
    });
  } catch (err) {
    return next(err);
  }
};

module.exports.userLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return sendResponse(req, res, {
      statusCode: 200,
      message: "You are logged out!",
      redirectUrl: "/listings",
    });
  });
};

module.exports.toggleWishlist = async (req, res) => {
  const { listingId } = req.params;
  if (!req.isAuthenticated()) {
    return sendResponse(req, res, {
      statusCode: 401,
      message: "Please log in to save favorites",
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return sendResponse(req, res, {
      statusCode: 404,
      message: "User not found",
    });
  }

  if (!user.wishlist) {
    user.wishlist = [];
  }

  const stringWishlist = user.wishlist.map((id) => id.toString());
  const index = stringWishlist.indexOf(listingId.toString());

  let isFavorite = false;
  if (index > -1) {
    user.wishlist.splice(index, 1);
    isFavorite = false;
  } else {
    user.wishlist.push(listingId);
    isFavorite = true;
  }

  await user.save();

  return sendResponse(req, res, {
    statusCode: 200,
    message: isFavorite ? "Saved to wishlist" : "Removed from wishlist",
    data: {
      isFavorite,
      wishlist: user.wishlist,
    },
  });
};

module.exports.getWishlist = async (req, res) => {
  if (!req.isAuthenticated()) {
    return sendResponse(req, res, {
      statusCode: 401,
      message: "Please log in to view wishlist",
    });
  }

  const user = await User.findById(req.user._id).populate("wishlist");
  return sendResponse(req, res, {
    statusCode: 200,
    data: {
      wishlist: user?.wishlist || [],
    },
  });
};