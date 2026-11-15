const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    occupiedDates: [{ type: String }],
    holdExpiresAt: { type: Date },
    totalAmount: { type: Number, required: true }, // Full amount in paise (including service fee & applicable taxes)
    pricingBreakdown: {
      nights: Number,
      pricePerNight: Number,
      basePrice: Number,
      serviceFee: Number,
      tax: Number,
      totalRupees: Number,
    },
    orderId: { type: String, required: true }, 
    paymentId: { type: String },              
    signature: { type: String },                
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

bookingSchema.index(
  { listing: 1, occupiedDates: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["PENDING", "PAID"] },
      occupiedDates: { $exists: true },
    },
  }
);

bookingSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Booking", bookingSchema);
