const Listing = require("../models/listing");
const Booking = require("../models/booking");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;
const { sendResponse } = require("../utils/responseHandler");
const { normalizeListingPayload } = require("../utils/listingPayload");
const {
  parseDateOnly,
  rangesOverlap,
  buildActiveBookingFilter,
  serializeBookedRanges,
  flattenBookedDates,
} = require("../utils/bookingDates");

module.exports.index = async (req, res) => {
  const { city, category, sort, checkIn, checkOut, guests } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 8);
  let allListings = [];

  if (!req.session.searchHistory) req.session.searchHistory = [];

  const filter = {};

  if (city && city.trim()) {
    const trimmedCity = city.trim();
    if (!req.session.searchHistory.includes(trimmedCity)) {
      req.session.searchHistory.unshift(trimmedCity);
      req.session.searchHistory = req.session.searchHistory.slice(0, 5);
    }
    const searchRegex = new RegExp(trimmedCity, "i");
    filter.$or = [
      { location: { $regex: searchRegex } },
      { country: { $regex: searchRegex } },
      { title: { $regex: searchRegex } },
    ];
  }

  if (category && category.trim()) {
    filter.category = category.trim();
  }

  if (checkIn && checkOut) {
    const startDate = parseDateOnly(checkIn);
    const endDate = parseDateOnly(checkOut);
    if (startDate && endDate && startDate < endDate) {
      const bookedListingIds = await Booking.find({
        $and: [
          buildActiveBookingFilter(),
          {
            checkIn: { $lt: endDate },
            checkOut: { $gt: startDate },
          },
        ],
      }).distinct("listing");

      if (bookedListingIds && bookedListingIds.length > 0) {
        filter._id = { $nin: bookedListingIds };
      }
    }
  }

  if (guests) {
    const guestCount = parseInt(guests, 10);
    if (!isNaN(guestCount) && guestCount > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { guests: { $gte: guestCount } },
          { guests: { $exists: false } },
          { guests: null },
        ],
      });
    }
  }

  let sortOption = {};
  if (sort === "price_asc" || sort === "price_low") {
    sortOption = { price: 1 };
  } else if (sort === "price_desc" || sort === "price_high") {
    sortOption = { price: -1 };
  } else if (sort === "newest") {
    sortOption = { _id: -1 };
  } else if (sort === "title_asc" || sort === "name_asc") {
    sortOption = { title: 1 };
  }

  allListings = await Listing.find(filter).populate("reviews").sort(sortOption);

  if (sort === "price_asc" || sort === "price_low") {
    allListings.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sort === "price_desc" || sort === "price_high") {
    allListings.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  } else if (sort === "newest") {
    allListings.sort((a, b) => (b._id > a._id ? 1 : -1));
  } else if (sort === "title_asc" || sort === "name_asc") {
    allListings.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }

  const totalListings = allListings.length;
  const totalPages = Math.max(1, Math.ceil(totalListings / limit));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * limit;
  const paginatedListings = allListings.slice(startIndex, startIndex + limit);

  const enrichedListings = paginatedListings.map((item) => {
    const doc = item.toObject ? item.toObject() : { ...item };
    const revs = doc.reviews || [];
    const total = revs.length;
    const avg = total > 0
      ? Number((revs.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / total).toFixed(2))
      : null;
    return {
      ...doc,
      avgRating: avg,
      reviewCount: total,
    };
  });

  return sendResponse(req, res, {
    renderView: "home.ejs",
    data: {
      allListings: enrichedListings,
      listings: enrichedListings,
      category: category || "",
      city: city || "",
      sort: sort || "",
      searchHistory: req.session.searchHistory,
      currentPage,
      totalPages,
      totalListings,
      limit,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  });
};

module.exports.availability = async (req, res) => {
  const listing = await Listing.exists({ _id: req.params.id });
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  const { checkIn, checkOut } = req.query;
  const hasCheckIn = Boolean(checkIn);
  const hasCheckOut = Boolean(checkOut);

  if (hasCheckIn !== hasCheckOut) {
    return res.status(400).json({
      success: false,
      message: "Both check-in and check-out dates are required",
    });
  }

  let startDate = null;
  let endDate = null;

  if (hasCheckIn && hasCheckOut) {
    startDate = parseDateOnly(checkIn);
    endDate = parseDateOnly(checkOut);

    if (!startDate || !endDate || startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }
  }

  const bookings = await Booking.find({
    listing: req.params.id,
    ...buildActiveBookingFilter(),
  })
    .select("checkIn checkOut")
    .lean();

  const bookedRanges = serializeBookedRanges(bookings);
  const bookedDates = flattenBookedDates(bookings);
  const payload = {
    success: true,
    bookedRanges,
    bookedDates,
  };

  if (startDate && endDate) {
    payload.available = !bookings.some((booking) =>
      rangesOverlap(
        startDate,
        endDate,
        new Date(booking.checkIn),
        new Date(booking.checkOut)
      )
    );
  }

  return res.status(200).json(payload);
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
    return sendResponse(req, res, {
      statusCode: 404,
      message: "Listing does not exist!",
      redirectUrl: "/listings",
      flashType: "error"
    });
  }

  return sendResponse(req, res, {
    renderView: "show.ejs",
    data: { listing }
  });
};
module.exports.create = async (req, res) => {
  const listingData = normalizeListingPayload(req.body);

  let geometry = { type: "Point", coordinates: [77.2090, 28.6139] };
  if (geocodingClient) {
    try {
      let response = await geocodingClient
        .forwardGeocode({
          query: listingData.location,
          limit: 1,
          types: ["place"]
        })
        .send();
      if (response?.body?.features?.[0]?.geometry) {
        geometry = response.body.features[0].geometry;
      }
    } catch (err) {
      console.error("Geocoding Error:", err);
    }
  }

  const newListing = new Listing(listingData);
  newListing.owner = req.user._id;

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
  } else {
    newListing.image = { 
      url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60", 
      filename: "defaultimage" 
    };
  }

  newListing.geometry = geometry;
  let savedListing = await newListing.save();

  return sendResponse(req, res, {
    statusCode: 201,
    message: "New listing Created!",
    data: { listing: savedListing },
    redirectUrl: "/listings",
    flashType: "info"
  });
};

module.exports.edit = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    return sendResponse(req, res, {
      statusCode: 404,
      message: "does not exist",
      redirectUrl: "/listings",
      flashType: "error"
    });
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  
  return sendResponse(req, res, {
    renderView: "edit.ejs",
    data: { listing, originalImageUrl }
  });
};
module.exports.update = async (req, res) => {
  let { id } = req.params;
  const listingData = normalizeListingPayload(req.body);
  let listing = await Listing.findByIdAndUpdate(id, listingData, { new: true });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  return sendResponse(req, res, {
    message: "listing is updated",
    data: { listing },
    redirectUrl: `/listings/${id}`,
    flashType: "info"
  });
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  
  return sendResponse(req, res, {
    message: "Listing is deleted!",
    data: { deletedListing },
    redirectUrl: "/listings",
    flashType: "info"
  });
};
