const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const ExpressError = require("../utils/expressErr.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");



//Reviews
//post methood
router.post("/",
   isLoggedIn,
   validateReview,
   wrapAsync(reviewController.createreview));

//Delete route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync
  (reviewController.destroyreview));

module.exports = router;