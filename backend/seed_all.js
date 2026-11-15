require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const User = require("./models/user.js");
const initData = require("./init/data.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/staygo";

const CITY_COORDINATES = {
  goa: [74.124, 15.2993],
  mumbai: [72.8777, 19.076],
  delhi: [77.209, 28.6139],
  manali: [77.1892, 32.2432],
  udaipur: [73.7125, 24.5854],
  jaipur: [75.7873, 26.9124],
  bengaluru: [77.5946, 12.9716],
  bangalore: [77.5946, 12.9716],
  pune: [73.8567, 18.5204],
  shimla: [77.1734, 31.1048],
  rishikesh: [78.2676, 30.0869],
  kolkata: [88.3639, 22.5726],
  chennai: [80.2707, 13.0827],
  hyderabad: [78.4867, 17.385],
  lonavala: [73.4091, 18.7557],
  kerala: [76.2711, 10.8505],
  ooty: [76.695, 11.4102],
  wayanad: [76.132, 11.6854],
  alleppey: [76.3388, 9.4981],
  jaisalmer: [70.9083, 26.9157],
  gulmarg: [74.3805, 34.0484],
  varanasi: [82.9739, 25.3176],
  darjeeling: [88.2627, 27.041],
  gokarna: [74.3188, 14.5479],
  puducherry: [79.8083, 11.9416],
  munnar: [77.0595, 10.0889],
};

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

async function seed() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB for seed_all");

  let ownerUser = await User.findOne();
  if (!ownerUser) {
    const dummyUser = new User({ email: "admin@staygo.com", username: "admin" });
    ownerUser = await User.register(dummyUser, "Admin123!");
  }

  for (let i = 0; i < initData.data.length; i++) {
    const item = initData.data[i];
    const existing = await Listing.findOne({ title: item.title });
    if (existing) continue;

    let coords = [77.209, 28.6139];
    const locLower = (item.location || "").toLowerCase();
    for (const [cName, cCoords] of Object.entries(CITY_COORDINATES)) {
      if (locLower.includes(cName)) {
        coords = [
          cCoords[0] + ((i % 5) - 2) * 0.015,
          cCoords[1] + ((Math.floor(i / 5) % 5) - 2) * 0.015,
        ];
        break;
      }
    }

    await Listing.create({
      ...item,
      owner: ownerUser._id,
      category: item.category || validCategories[i % validCategories.length],
      geometry: item.geometry || {
        type: "Point",
        coordinates: coords,
      },
    });
  }

  const total = await Listing.countDocuments();
  const mumbaiCount = await Listing.countDocuments({ location: /mumbai/i });
  console.log(`Total listings in DB: ${total}, Mumbai listings: ${mumbaiCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding all listings:", err);
  process.exit(1);
});
