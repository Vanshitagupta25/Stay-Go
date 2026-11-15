const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { sendResponse } = require("../utils/responseHandler.js");

module.exports.createreview = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    return sendResponse(req, res, {
      statusCode: 404,
      message: "Listing not found!",
      flashType: "error",
      redirectUrl: "/listings",
    });
  }

  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  await newReview.populate("author", "username email");

  return sendResponse(req, res, {
    statusCode: 201,
    message: "Review submitted successfully!",
    data: { review: newReview },
    redirectUrl: `/listings/${listing._id}`,
    flashType: "info",
  });
};

module.exports.destroyreview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  return sendResponse(req, res, {
    statusCode: 200,
    message: "Review deleted successfully!",
    data: { reviewId },
    redirectUrl: `/listings/${id}`,
    flashType: "info",
  });
};