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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
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

const sessionConfig = {
  store,
  secret: process.env.SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
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
  res.locals.info = req.flash("info");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  res.locals.searchHistory = req.session.searchHistory || [];
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

//Error-handling Middleware
app.use((err, req, res, next) => {
  const fs = require('fs');
  fs.appendFileSync('error.log', new Date().toISOString() + ' ' + (err.stack || err) + '\n');
  let { status = 500, statusCode = status, message = "Something went wrong!" } = err;
  
  return sendResponse(req, res, {
    statusCode,
    message,
    renderView: "error.ejs"
  });
});


// Background job to clean up PENDING bookings older than 24 hours
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
}, 60 * 60 * 1000); // Runs every 1 hour

app.listen(PORT, () => {
  console.log(`Server is listening on port, ${PORT}`);
})
