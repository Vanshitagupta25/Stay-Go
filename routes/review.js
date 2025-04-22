const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressErr.js");
const { reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const validateReview = (req,res, next) => {
  let {error} = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400 , errMsg);
  } else {
    next();
  }
};

//Reviews
//post methood
router.post("/" , validateReview,wrapAsync(async(req,res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("info" , "review is created");
  res.redirect("/listings");

}));

//Delete route
router.delete("/:reviewId" ,wrapAsync(async(req,res) => {
  let { id , reviewId} = req.params;

  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("info" , "review is deleted");
  res.redirect(`/listings/${id}`);

})
);

module.exports = router;