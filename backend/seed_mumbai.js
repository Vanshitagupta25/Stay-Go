require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const User = require("./models/user.js");
const { capacityByTitle } = require("./init/data.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/staygo";

const newMumbaiListings = [
  {
    title: "Sea-Facing Luxury Villa in Bandra",
    description:
      "Wake up to breathtaking Arabian Sea views from Bandra's iconic Carter Road. Featuring private terrace, plunge pool, and floor-to-ceiling glass windows.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    },
    price: 14500,
    location: "Bandra, Mumbai",
    country: "India",
    category: "pools",
    geometry: {
      type: "Point",
      coordinates: [72.8258, 19.0596],
    },
  },
  {
    title: "Art Deco Penthouse near Marine Drive",
    description:
      "Experience the timeless glamour of the Queen's Necklace in this heritage Art Deco penthouse with panoramic sunset views and rooftop lounge.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80",
    },
    price: 18000,
    location: "Marine Drive, Mumbai",
    country: "India",
    category: "iconicCities",
    geometry: {
      type: "Point",
      coordinates: [72.8238, 18.9438],
    },
  },
  {
    title: "Tropical Beachfront Haven in Juhu",
    description:
      "Steps from Juhu Beach, this tranquil sanctuary offers lush private garden, open-air sun deck, and gourmet chef kitchen. Walk to Mumbai's top cafes.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    },
    price: 12000,
    location: "Juhu, Mumbai",
    country: "India",
    category: "beach",
    geometry: {
      type: "Point",
      coordinates: [72.8267, 19.0988],
    },
  },
  {
    title: "Chic Designer Studio in Colaba",
    description:
      "A stone's throw from the Gateway of India and Colaba Causeway. Warm timber finishes, curated art collection, and high-speed fiber internet.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    },
    price: 6500,
    location: "Colaba, Mumbai",
    country: "India",
    category: "rooms",
    geometry: {
      type: "Point",
      coordinates: [72.8311, 18.9150],
    },
  },
  {
    title: "Skyline Glass Villa at Worli Sea Face",
    description:
      "Unmatched vistas of the Bandra-Worli Sea Link from an ultra-modern sky villa with infinity jacuzzi, smart home automation, and private elevator.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    },
    price: 22000,
    location: "Worli, Mumbai",
    country: "India",
    category: "iconicCities",
    geometry: {
      type: "Point",
      coordinates: [72.8183, 19.0068],
    },
  },
];

async function run() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB:", MONGO_URL);

    let ownerUser = await User.findOne();
    if (!ownerUser) {
      ownerUser = await User.create({ email: "admin@staygo.com", username: "admin" });
    }

    const docs = newMumbaiListings.map((item) => ({
      ...item,
      ...(capacityByTitle[item.title] || {}),
      owner: ownerUser._id,
    }));

    for (const doc of docs) {
      const existing = await Listing.findOne({ title: doc.title });
      if (!existing) {
        await Listing.create(doc);
        console.log(`Inserted: ${doc.title}`);
      } else {
        console.log(`Already exists: ${doc.title}`);
      }
    }

    const totalMumbai = await Listing.countDocuments({ location: /mumbai/i });
    console.log(`Total listings in Mumbai now: ${totalMumbai}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding Mumbai listings:", err);
    process.exit(1);
  }
}

run();
