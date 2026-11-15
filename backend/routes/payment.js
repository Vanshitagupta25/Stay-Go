const express = require("express");
const router = express.Router();
const { createOrder, verifySignature, cancelOrder, getUserBookings } = require("../controllers/payment");
const { isLoggedIn } = require("../middleware.js");

router.post("/create-order", isLoggedIn, createOrder);
router.post("/verify-signature", isLoggedIn, verifySignature);
router.post("/cancel-order", isLoggedIn, cancelOrder);
router.get("/my-bookings", isLoggedIn, getUserBookings);

module.exports = router;