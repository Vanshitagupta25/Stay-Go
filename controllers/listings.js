const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
 const { city, category } = req.query;
 let allListings = [];

 if(!req.session.searchHistory) req.session.searchHistory = [];

 if (city) {
  if(!req.session.searchHistory.includes(city)) {
    req.session.searchHistory.unshift(city);
    req.session.searchHistory = req.session.searchHistory.slice(0,5);
  }
 }
 if(city && category) {
   const matchedListings = await Listing.find({
    location: { $regex: new RegExp(city, "i")},
    category: category,
  });

  matchedListings.forEach(listing => listing.isMatched = true);
  const otherListings = await Listing.find({
    $or: [
    { location: {$not: { $regex: new RegExp(city, "i")} }},
    { category: { $ne: category }},
    ],
  });

  allListings = [...matchedListings, ...otherListings];
 }
 else if (city) {
    const matchedListings = await Listing.find({
      location: { $regex: new RegExp(city, "i") },
    });
    matchedListings.forEach(listing => (listing.isMatched = true));

    const otherListings = await Listing.find({
      location: { $not: { $regex: new RegExp(city, "i") } },
    });

    allListings = [...matchedListings, ...otherListings];
  }
  else if(category){
  allListings = await Listing.find({category});
 }
 else {
  allListings = await Listing.find({});
 }
 console.log("Search working for:", city || "All cities");
  console.log("Category filter:", category || "None");

 res.render("home.ejs", {
  allListings,
  category,
  searchHistory: req.session.searchHistory
});
};

module.exports.new = (req, res) => {
  res.render("new.ejs");
};
module.exports.show = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
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
module.exports.create = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);
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

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("edit.ejs", { listing, originalImageUrl });
};
module.exports.update = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
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
};
