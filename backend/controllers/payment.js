const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { calculateBookingPrice } = require("../utils/pricingCalculator");
const {
    HOLD_DURATION_MS,
    parseDateOnly,
    buildOccupiedDates,
    rangesOverlap,
    buildActiveBookingFilter,
} = require("../utils/bookingDates");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

function getUserId(req) {
    return req.user?._id || req.user?.id;
}

function bookedConflictResponse(res) {
    return res.status(409).json({
        success: false,
        message: "These dates are already booked. Please choose different dates.",
    });
}

exports.createOrder = async (req, res) => {
    try {
        const { listingId, checkIn, checkOut } = req.body;
        const userId = getUserId(req);

        if (!listingId || !checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: "Listing and both stay dates are required",
            });
        }

        const checkInDate = parseDateOnly(checkIn);
        const checkoutDate = parseDateOnly(checkOut);

        if (!checkInDate || !checkoutDate || checkInDate >= checkoutDate) {
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date",
            });
        }

        const occupiedDates = buildOccupiedDates(checkInDate, checkoutDate);
        if (occupiedDates.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid date range" });
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        const conflictingBooking = await Booking.findOne({
            $and: [
                buildActiveBookingFilter(),
                {
                    listing: listing._id,
                    checkIn: { $lt: checkoutDate },
                    checkOut: { $gt: checkInDate },
                },
            ],
        });

        if (conflictingBooking) {
            return bookedConflictResponse(res);
        }

        const numberOfNights = Math.round(
            (checkoutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
        );

        const pricing = calculateBookingPrice({
            pricePerNight: listing.price,
            numberOfNights,
        });

        const totalAmount = pricing.totalPaise;

        const order = await razorpay.orders.create({
            amount: totalAmount,
            currency: "INR",
            receipt: `booking_${Date.now()}`,
        });

        const booking = new Booking({
            listing: listing._id,
            user: userId,
            checkIn: checkInDate,
            checkOut: checkoutDate,
            occupiedDates,
            holdExpiresAt: new Date(Date.now() + HOLD_DURATION_MS),
            totalAmount,
            pricingBreakdown: {
                nights: pricing.nights,
                pricePerNight: pricing.pricePerNight,
                basePrice: pricing.basePrice,
                serviceFee: pricing.serviceFee,
                tax: pricing.tax,
                totalRupees: pricing.totalRupees,
            },
            orderId: order.id,
            status: "PENDING",
        });

        try {
            await booking.save();
        } catch (error) {
            if (error?.code === 11000) {
                return bookedConflictResponse(res);
            }
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: "Order created",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            bookingId: booking._id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            pricing: {
                nights: pricing.nights,
                pricePerNight: pricing.pricePerNight,
                basePrice: pricing.basePrice,
                serviceFee: pricing.serviceFee,
                tax: pricing.tax,
                totalRupees: pricing.totalRupees,
            },
        });
    } catch (error) {
        console.error("Error in createOrder:", error);
        return res.status(500).json({
            success: false,
            message: error.message || error.description || "Server Error",
        });
    }
};

exports.verifySignature = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, signature } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required",
            });
        }

        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid Payment Signature",
            });
        }

        const booking = await Booking.findOne({
            orderId: razorpayOrderId,
            user: getUserId(req),
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.status === "PAID") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                bookingId: booking._id,
            });
        }

        const updatedBooking = await Booking.findOneAndUpdate(
            {
                _id: booking._id,
                user: getUserId(req),
                status: "PENDING",
            },
            {
                $set: {
                    paymentId: razorpayPaymentId,
                    signature,
                    status: "PAID",
                },
                $unset: { holdExpiresAt: 1 },
            },
            { new: true }
        );

        if (!updatedBooking) {
            const current = await Booking.findById(booking._id);
            if (current?.status === "PAID") {
                return res.status(200).json({
                    success: true,
                    message: "Payment already verified",
                    bookingId: current._id,
                });
            }
            return bookedConflictResponse(res);
        }

        return res.status(200).json({
            success: true,
            message: "Payment Verified",
            bookingId: updatedBooking._id,
        });
    } catch (error) {
        console.error("Error in verifySignature:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking id is required",
            });
        }

        const booking = await Booking.findOneAndUpdate(
            {
                _id: bookingId,
                user: getUserId(req),
                status: "PENDING",
            },
            {
                $set: { status: "FAILED" },
                $unset: { holdExpiresAt: 1 },
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Pending booking not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Checkout cancelled and dates released",
        });
    } catch (error) {
        console.error("Error in cancelOrder:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const userId = getUserId(req);
        const bookings = await Booking.find({ user: userId })
            .populate("listing")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("Error in getUserBookings:", error);
        res.status(500).json({ success: false, message: "Server Error fetching bookings" });
    }
};

module.exports.razorpay = razorpay;
