require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/staygo";

const sampleReviewData = [
  { rating: 5, comment: "Exceeded all expectations! The view was breathtaking and the host was super welcoming." },
  { rating: 5, comment: "One of the best stays we've ever booked. Spotless, cozy, and beautifully designed." },
  { rating: 4, comment: "Great location and wonderful amenities. Loved our weekend stay here." },
  { rating: 5, comment: "Peaceful oasis in the middle of everything. We will definitely come back next year!" },
  { rating: 4, comment: "Very comfortable beds, high-speed Wi-Fi, and stunning surroundings." },
  { rating: 5, comment: "Pictures don't even do it justice. A truly 5-star experience from start to finish." },
];

async function seedReviews() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB for seedReviews");

  let user = await User.findOne();
  if (!user) {
    user = await User.create({ username: "wanderer_riya", email: "riya@staygo.com" });
  }

  const listings = await Listing.find().populate("reviews");
  let reviewsAdded = 0;

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    // Seed 1-2 reviews for every 2nd or 3rd listing so some have reviews (4.7-5.0) and some are "New"
    if (listing.reviews.length === 0 && (i % 2 === 0 || i < 6)) {
      const reviewCount = (i % 3 === 0) ? 2 : 1;
      for (let r = 0; r < reviewCount; r++) {
        const sample = sampleReviewData[(i + r) % sampleReviewData.length];
        const newReview = await Review.create({
          rating: sample.rating,
          comment: sample.comment,
          author: user._id,
        });
        listing.reviews.push(newReview._id);
        reviewsAdded++;
      }
      await listing.save();
      console.log(`Added reviews to: ${listing.title}`);
    }
  }

  console.log(`Successfully added ${reviewsAdded} sample reviews!`);
  await mongoose.disconnect();
  process.exit(0);
}

seedReviews().catch((err) => {
  console.error("Error seeding reviews:", err);
  process.exit(1);
});
