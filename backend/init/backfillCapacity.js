require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const { capacityByTitle } = require("./data.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/staygo";
const CAPACITY_FIELDS = ["guests", "bedrooms", "beds", "bathrooms"];

function missingCapacityFields(listing, capacity) {
  const update = {};
  for (const field of CAPACITY_FIELDS) {
    if (listing[field] === undefined || listing[field] === null) {
      update[field] = capacity[field];
    }
  }
  return update;
}

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB for capacity backfill");

  let updatedListings = 0;

  for (const [title, capacity] of Object.entries(capacityByTitle)) {
    const listing = await Listing.findOne({ title });
    if (!listing) continue;

    const update = missingCapacityFields(listing, capacity);
    if (Object.keys(update).length === 0) continue;

    await Listing.updateOne({ _id: listing._id }, { $set: update });
    updatedListings += 1;
    console.log(`Backfilled capacity for: ${title}`);
  }

  console.log(`Capacity backfill complete. Updated ${updatedListings} listing(s).`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("Error backfilling listing capacity:", err);
  await mongoose.disconnect();
  process.exit(1);
});
