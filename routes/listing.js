const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { ListingSchema} = require("../schema.js");
const ExpressError = require("../utils/expressErr.js");
const Listing = require("../models/listing.js");

const validateListing = (req,res, next) => {
  let {error} = ListingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400 , errMsg);
  } else {
    next();
  }
};



//Index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find();
    console.log("working");
    res.render("home.ejs", { allListing });
  })
);

router.get("/new", (req, res) => {
  res.render("new.ejs");
});
//show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if(!listing) {
      req.flash("error" , "Listing does not exist!");
      res.redirect("/listings");
    }
    res.render("show.ejs", { listing });
  })
);
//create route
router.post(
  "/", validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("info" , "New listing Created!");
    res.redirect("/listings");
  })
);
//edit route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing) {
      req.flash("error" , "does not exist");
      res.redirect("/listings");
    }
    res.render("edit.ejs", { listing });
  })
);
//update route
router.put(
  "/:id", validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("info" , "listing is updated");
    res.redirect(`/listings/${id}`);
  })
);
//delete route
router.delete(
  "/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("info" , "Listing is deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;