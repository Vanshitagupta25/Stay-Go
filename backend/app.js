const util = require("util");
if (util.isArray !== Array.isArray) {
  util.isArray = Array.isArray;
}
const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listingRouter = require("./routes/listing.js");

const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/staygo";
const PORT = process.env.PORT || 8080;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
};

const cors = require("cors");

const isProduction = process.env.NODE_ENV;
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  ...(process.env.FRONTEND_URL || process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.trim().replace(/\/+$/, "");
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const paymentRouter = require("./routes/payment.js");

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET || "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const cookieSameSiteEnv = (process.env.COOKIE_SAMESITE || "").toLowerCase();
const cookieSecureEnv = process.env.COOKIE_SECURE;

const cookieSameSite =
  cookieSameSiteEnv === "none" || cookieSameSiteEnv === "lax" || cookieSameSiteEnv === "strict"
    ? cookieSameSiteEnv
    : isProduction
      ? "none"
      : "lax";

const cookieSecure =
  cookieSecureEnv === "true"
    ? true
    : cookieSecureEnv === "false"
      ? false
      : isProduction;

const sessionConfig = {
  store,
  name: "staygo.sid",
  secret: process.env.SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.info = typeof req.flash === "function" ? req.flash("info") : [];
  res.locals.error = typeof req.flash === "function" ? req.flash("error") : [];
  res.locals.currUser = req.user || null;
  res.locals.searchHistory = (req.session && req.session.searchHistory) || [];
  next();
});
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/api/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/api/listings/:id/reviews", reviewRouter);
app.use("/api/payment", paymentRouter);
app.use("/payment", paymentRouter);
app.use("/", userRouter);
app.use("/api", userRouter);

const { sendResponse } = require("./utils/responseHandler.js");

app.use((req, res, next) => {
  return sendResponse(req, res, {
    statusCode: 404,
    message: "Page / API route not found",
    renderView: "notFound.ejs"
  });
});

app.use((err, req, res, next) => {
  try {
    const fs = require('fs');
    fs.appendFileSync('error.log', new Date().toISOString() + ' ' + (err.stack || err) + '\n');
  } catch (_) { }
  const { status = 500, statusCode = status, message = "Something went wrong!" } = err || {};
  return sendResponse(req, res, {
    statusCode,
    message,
    renderView: "error.ejs"
  });
});

setInterval(async () => {
  try {
    const Booking = require('./models/booking.js');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Booking.deleteMany({
      status: "PENDING",
      createdAt: { $lt: twentyFourHoursAgo }
    });
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired pending bookings`);
    }
  } catch (err) {
    console.error("Error in background cleanup job:", err);
  }
}, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server is listening on port, ${PORT}`);
})
