const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index =  async (req, res) => {
    const allListing = await Listing.find({});
    console.log("working");
    res.render("home.ejs", { allListing });
  };

module.exports.new = (req, res) => {
    res.render("new.ejs");
  };
module.exports.show = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    .populate({
      path:"reviews",
      populate: {
      path: "author"
    },
    })
    .populate("owner");
    if (!listing) {
      req.flash("error", "Listing does not exist!");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("show.ejs", { listing });
  };
module.exports.create = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();
  

      let url = req.file.path;
      let filename = req.file.filename;
      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
      newListing.image = {url , filename};
      await newListing.save();

      newListing.geometry = response.body.features[0].geometry;

      let saveListing = await newListing.save();
      console.log(saveListing);
      req.flash("info", "New listing Created!");
      res.redirect("/listings");
    };

module.exports.edit = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "does not exist");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("edit.ejs", { listing , originalImageUrl});
};
module.exports.update = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url , filename};
    await listing.save();
    }

    req.flash("info", "listing is updated");
    res.redirect(`/listings/${id}`);
  };

  module.exports.delete = async (req, res) => {
      let { id } = req.params;
      let deletedListing = await Listing.findByIdAndDelete(id);
      console.log(deletedListing);
      req.flash("info", "Listing is deleted!");
      res.redirect("/listings");
    }