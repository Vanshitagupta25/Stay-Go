const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLogedIn, isOwner, validateListing , validateReview} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("./cloudConfig.js");
const upload = multer({ storage });



// create router
router.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLogedIn,
  upload.single('image'),
  wrapAsync(listingController.create)
);


// new route
router.get("/new", isLogedIn,listingController.new);

router.route("/:id")
.get(
  isLogedIn,
  wrapAsync(listingController.show))
  .put(
  isLogedIn,
  isOwner,
  upload.single('image'),
  validateListing,
  wrapAsync(listingController.update))
  .delete(
  isLogedIn,
  isOwner,
  wrapAsync(listingController.delete)
);

//edit route
router.get(
  "/:id/edit",
  isLogedIn,
  isOwner,
  wrapAsync(listingController.edit));


module.exports = router;
