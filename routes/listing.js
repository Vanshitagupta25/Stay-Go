const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLogedIn, isOwner, validateListing , validateReview} = require("../middleware.js");
const listingController = require("../controllers/listings.js");

//Index route
router.get("/",wrapAsync(listingController.index));

// new route
router.get("/new", isLogedIn,listingController.new);

//show route
router.get(
  "/:id",
  isLogedIn,
  wrapAsync(listingController.show));

//create route
router.post(
  "/",
  isLogedIn,
  validateListing,
  wrapAsync(listingController.create));

//edit route
router.get(
  "/:id/edit",
  isLogedIn,
  isOwner,
  wrapAsync(listingController.edit));
  
//update route
router.put(
  "/:id",
  isLogedIn,
  isOwner,
  validateListing,
  wrapAsync(listingController.update));
//delete route
router.delete(
  "/:id",
  isLogedIn,
  isOwner,
  wrapAsync(listingController.delete));

module.exports = router;
