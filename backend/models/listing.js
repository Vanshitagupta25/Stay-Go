const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const wholeNumberValidator = {
  validator: (value) => value == null || Number.isInteger(value),
  message: "{PATH} must be a whole number",
};

const halfStepValidator = {
  validator: (value) => value == null || (Number.isFinite(value) && Number.isInteger(value * 2)),
  message: "{PATH} must be in increments of 0.5",
};

const listingSchema = new Schema({
  title: {
    type: String,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String, 
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
   category: {
      type: String,
      enum: ["mountains","rooms", "pools", "beach", "farms", "camping", "bedAndBreakfast", "iconicCities","domes"],
      required: true,
    },
    guests: {
      type: Number,
      min: 1,
      validate: wholeNumberValidator,
    },
    bedrooms: {
      type: Number,
      min: 0,
      validate: wholeNumberValidator,
    },
    beds: {
      type: Number,
      min: 1,
      validate: wholeNumberValidator,
    },
    bathrooms: {
      type: Number,
      min: 0,
      validate: halfStepValidator,
    },
    amenities: {
      type: [String],
      default: [],
    },
});

listingSchema.post("findOneAndDelete" , async(listing) => {
  if(listing) {
    await Review.deleteMany({_id: {$in: listing.reviews}});
  }

})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
