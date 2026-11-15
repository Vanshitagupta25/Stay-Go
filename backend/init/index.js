require("dotenv").config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/staygo";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB:", MONGO_URL);

  let ownerUser = await User.findOne();
  if (!ownerUser) {
    const dummyUser = new User({ email: "admin@staygo.com", username: "admin" });
    ownerUser = await User.register(dummyUser, "Admin123!");
  }

  await Listing.deleteMany({});

  const validCategories = [
    "mountains",
    "rooms",
    "pools",
    "beach",
    "farms",
    "camping",
    "bedAndBreakfast",
    "iconicCities",
    "domes",
  ];

  const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
  const mapToken = process.env.MAP_TOKEN;
  const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

  const listingsWithOwner = [];

  for (let i = 0; i < initData.data.length; i++) {
    const obj = initData.data[i];
    let geometry = {
      type: "Point",
      coordinates: [77.2090 + (i * 0.01), 28.6139 + (i * 0.01)], // fallback
    };

    if (geocodingClient) {
      try {
        let response = await geocodingClient
          .forwardGeocode({
            query: obj.location,
            limit: 1,
          })
          .send();
        if (response?.body?.features?.[0]?.geometry) {
          geometry = response.body.features[0].geometry;
        }
      } catch (err) {
        console.error(`Geocoding failed for ${obj.location}:`, err.message);
      }
    }

    listingsWithOwner.push({
      ...obj,
      owner: ownerUser._id,
      category: validCategories[i % validCategories.length],
      geometry: geometry,
    });
  }

  await Listing.insertMany(listingsWithOwner);
  console.log(`Successfully initialized DB with ${listingsWithOwner.length} listings!`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error initializing DB:", err);
  process.exit(1);
});