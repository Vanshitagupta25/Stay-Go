const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLogedIn, isReviewAuthor} = require("../middleware.js");
const ExpressError = require("../utils/expressErr.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");



//Reviews
//post methood
router.post("/",
   isLogedIn,
   validateReview,
   wrapAsync(reviewController.createreview));

//Delete route
router.delete(
  "/:reviewId",
  isLogedIn,
  isReviewAuthor,
  wrapAsync
  (reviewController.destroyreview));

module.exports = router;