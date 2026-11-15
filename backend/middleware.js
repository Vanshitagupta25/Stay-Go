const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/expressErr.js");
const { ListingSchema, reviewSchema } = require("./schema.js");
const { sendResponse } = require("./utils/responseHandler.js");

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    return sendResponse(req, res, {
      statusCode: 401,
      message: "You must be logged in!",
      redirectUrl: "/login",
    });
  }
  next();
};

module.exports.isLoggedIn = isLoggedIn;

module.exports.saveRedirectUrl = ((req,res,next) => {
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
});

module.exports.isOwner = async(req,res,next)=> {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!res.locals.currUser || !listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error" , "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
module.exports.validateListing = (req, res, next) => {
  let { error } = ListingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
module.exports.validateReview = (req, res, next) => {
  if (!req.body.review && (req.body.rating || req.body.comment)) {
    req.body.review = {
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
  }
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    return sendResponse(req, res, {
      statusCode: 400,
      message: errMsg,
      redirectUrl: `/listings/${req.params.id}`,
      flashType: "error",
    });
  } else {
    next();
  }
};
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    return sendResponse(req, res, {
      statusCode: 404,
      message: "Review not found!",
      redirectUrl: `/listings/${id}`,
      flashType: "error",
    });
  }
  const currUser = req.user || res.locals.currUser;
  if (!currUser || !review.author.equals(currUser._id)) {
    return sendResponse(req, res, {
      statusCode: 403,
      message: "You are not the author of this review!",
      redirectUrl: `/listings/${id}`,
      flashType: "error",
    });
  }
  next();
};