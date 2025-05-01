const Listing = require("../models/listing");

module.exports.index =  async (req, res) => {
    const allListing = await Listing.find();
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
      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
      await newListing.save();
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
  res.render("edit.ejs", { listing });
};
module.exports.update = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
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