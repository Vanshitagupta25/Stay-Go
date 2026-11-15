const sampleListings = [
  {
    title: "Cozy Beachfront Cottage",
    description:
      "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1500,
    location: "Goa",
    country: "India",
  },
  {
    title: "Modern Loft in Downtown",
    description:
      "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1200,
    location: "Mumbai",
    country: "India",
  },
  {
    title: "Mountain Retreat",
    description:
      "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 1000,
    location: "Manali",
    country: "India",
  },
  {
    title: "Historic Haveli in Rajasthan",
    description:
      "Experience the royal charm of Rajasthan in this beautifully restored Haveli.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 2500,
    location: "Udaipur",
    country: "India",
  },
  {
    title: "Secluded Treehouse Getaway",
    description:
      "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 800,
    location: "Lonavala",
    country: "India",
  },
  {
    title: "Backwaters Houseboat",
    description:
      "Drift peacefully along the serene backwaters in a traditional houseboat.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 2000,
    location: "Alleppey",
    country: "India",
  },
  {
    title: "Riverside Camp",
    description:
      "Spend your days rafting and relaxing by the river. This cozy camp is perfect for outdoor enthusiasts.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 900,
    location: "Rishikesh",
    country: "India",
  },
  {
    title: "Luxury Penthouse with City Views",
    description:
      "Indulge in luxury living with panoramic city views from this stunning penthouse apartment.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2t5JTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 3500,
    location: "Bangalore",
    country: "India",
  },
  {
    title: "Snowy Mountain Chalet",
    description:
      "Hit the slopes right from your doorstep in this cozy chalet in the Himalayas.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNreSUyMHZhY2F0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 3000,
    location: "Gulmarg",
    country: "India",
  },
  {
    title: "Desert Safari Camp",
    description:
      "Experience the thrill of the desert dunes in a comfortable luxury camp.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 4000,
    location: "Jaisalmer",
    country: "India",
  },
  {
    title: "Heritage Home in French Quarter",
    description:
      "Stay in a piece of history in this beautifully preserved home with French colonial architecture.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FtcGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1800,
    location: "Puducherry",
    country: "India",
  },
  {
    title: "Private Island Retreat",
    description:
      "Have an entire island to yourself for a truly exclusive and unforgettable vacation experience.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1618140052121-39fc6db33972?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9kZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 10000,
    location: "Andaman and Nicobar",
    country: "India",
  },
  {
    title: "Charming Tea Estate Bungalow",
    description:
      "Escape to the picturesque rolling hills and enjoy freshly brewed tea every morning.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1602088113235-229c19758e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmVhY2glMjB2YWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1200,
    location: "Darjeeling",
    country: "India",
  },
  {
    title: "Historic Apartment in South Mumbai",
    description:
      "Step back in time in this elegant historic apartment located in the heart of Mumbai.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1533619239233-6280475a633a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNreSUyMHZhY2F0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 2200,
    location: "South Mumbai",
    country: "India",
  },
  {
    title: "Beachfront Bungalow in Gokarna",
    description:
      "Relax on the pristine sandy shores in this beautiful beachfront bungalow.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1602391833977-358a52198938?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGNhbXBpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1800,
    location: "Gokarna",
    country: "India",
  },
  {
    title: "Mountain View Cabin in Shimla",
    description:
      "Enjoy breathtaking mountain views from this cozy cabin.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 1500,
    location: "Shimla",
    country: "India",
  },
  {
    title: "Art Deco Apartment in Delhi",
    description:
      "Step into the glamour of the 1920s in this stylish Art Deco apartment.",
    image: {
      filename: "listing[image]",
      url: "https://plus.unsplash.com/premium_photo-1670963964797-942df1804579?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 1600,
    location: "New Delhi",
    country: "India",
  },
  {
    title: "Tropical Villa in Kerala",
    description:
      "Escape to a tropical paradise in this luxurious villa with a private infinity pool.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 3000,
    location: "Munnar",
    country: "India",
  },
  {
    title: "Spiritual Retreat by the Ganges",
    description:
      "Find your peace in this spiritual retreat right on the ghats of the Ganges river.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJlYWNoJTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 4000,
    location: "Varanasi",
    country: "India",
  },
  {
    title: "Luxury Hillside Villa",
    description: "Perched high in the Western Ghats with an infinity pool overlooking lush rainforests and misty peaks.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=60",
    },
    price: 5200,
    location: "Coorg",
    country: "India",
  },
  {
    title: "Minimalist Dome with Stargazing",
    description: "Unique geodesic dome with panoramic stargazing ceiling surrounded by pine forests and apple orchards.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=60",
    },
    price: 3400,
    location: "Kaza",
    country: "India",
  },
  {
    title: "Sun-drenched Beach Villa",
    description: "Direct walk-on access to pristine white sand beach with private loungers, hammocks, and coconut palms.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60",
    },
    price: 4800,
    location: "Alibaug",
    country: "India",
  },
  {
    title: "Rustic Farm Stay & Dairy",
    description: "Experience genuine countryside tranquility with organic vegetable orchards, dairy cattle, and homemade meals.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&q=60",
    },
    price: 1300,
    location: "Nashik",
    country: "India",
  },
  {
    title: "Royal Palace View Suite",
    description: "Opulent marble suite overlooking the sparkling city lake and illuminated royal heritage monuments.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60",
    },
    price: 6500,
    location: "Jaipur",
    country: "India",
  },
  {
    title: "Pine Forest Glamping Pod",
    description: "Ultra-comfortable insulated glamping tent with private campfire pit, heated blankets, and mountain views.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=60",
    },
    price: 2100,
    location: "Kasol",
    country: "India",
  },
  {
    title: "Modern Oasis with Private Pool",
    description: "Spacious architectural villa equipped with Olympic-grade swimming pool, sunken bar, and landscaped garden.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=60",
    },
    price: 5800,
    location: "Hyderabad",
    country: "India",
  },
  {
    title: "Historic French Colony Suite",
    description: "Charming yellow facade with vintage terracotta arches, courtyard fountains, and French-fusion breakfast.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
    },
    price: 2600,
    location: "White Town",
    country: "India",
  },
  {
    title: "Sunset Cliffside Cottage",
    description: "Watch golden hour over the Arabian sea from your private wooden deck cliffside patio.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60",
    },
    price: 3100,
    location: "Varkala",
    country: "India",
  },
  {
    title: "Himalayan Stone Cottage",
    description: "Traditional hand-carved stone and deodar cedar cottage with crackling fireplace and apple garden.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=60",
    },
    price: 1900,
    location: "Dharamshala",
    country: "India",
  },
  {
    title: "Contemporary Glass Penthouse",
    description: "Floor-to-ceiling glass windows framing skyline views, featuring smart home controls and luxury bathtub.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=60",
    },
    price: 4900,
    location: "Gurgaon",
    country: "India",
  },
  {
    title: "Organic Vineyard Guest House",
    description: "Stay in the middle of sprawling grape vineyards with complimentary wine tasting and cellar tour.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60",
    },
    price: 2800,
    location: "Pune",
    country: "India",
  },
  {
    title: "Riverside Bamboo Eco-Lodge",
    description: "Eco-friendly sustainable bamboo cottage nestled beside a crystal-clear mountain stream.",
    image: {
      filename: "listing[image]",
      url: "https://images.unsplash.com/photo-1507038772120-7ffe76f79d0d?auto=format&fit=crop&w=800&q=60",
    },
    price: 1700,
    location: "Wayanad",
    country: "India",
  },
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
  },
];

const capacityByTitle = {
  "Cozy Beachfront Cottage": { guests: 4, bedrooms: 2, beds: 2, bathrooms: 2 },
  "Modern Loft in Downtown": { guests: 3, bedrooms: 1, beds: 2, bathrooms: 1 },
  "Mountain Retreat": { guests: 4, bedrooms: 2, beds: 3, bathrooms: 1.5 },
  "Historic Haveli in Rajasthan": { guests: 8, bedrooms: 4, beds: 5, bathrooms: 4 },
  "Secluded Treehouse Getaway": { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
  "Backwaters Houseboat": { guests: 4, bedrooms: 2, beds: 2, bathrooms: 2 },
  "Riverside Camp": { guests: 6, bedrooms: 3, beds: 3, bathrooms: 2 },
  "Luxury Penthouse with City Views": { guests: 6, bedrooms: 3, beds: 4, bathrooms: 3 },
  "Snowy Mountain Chalet": { guests: 8, bedrooms: 4, beds: 6, bathrooms: 3 },
  "Desert Safari Camp": { guests: 4, bedrooms: 2, beds: 2, bathrooms: 3 },
  "Heritage Home in French Quarter": { guests: 5, bedrooms: 2, beds: 3, bathrooms: 2 },
  "Private Island Retreat": { guests: 10, bedrooms: 5, beds: 6, bathrooms: 5 },
  "Charming Tea Estate Bungalow": { guests: 4, bedrooms: 2, beds: 3, bathrooms: 2 },
  "Historic Apartment in South Mumbai": { guests: 4, bedrooms: 2, beds: 2, bathrooms: 2 },
  "Beachfront Bungalow in Gokarna": { guests: 4, bedrooms: 2, beds: 3, bathrooms: 2 },
  "Mountain View Cabin in Shimla": { guests: 3, bedrooms: 1, beds: 2, bathrooms: 1 },
  "Art Deco Apartment in Delhi": { guests: 4, bedrooms: 2, beds: 2, bathrooms: 2 },
  "Tropical Villa in Kerala": { guests: 6, bedrooms: 3, beds: 4, bathrooms: 3 },
  "Spiritual Retreat by the Ganges": { guests: 6, bedrooms: 3, beds: 4, bathrooms: 3 },
  "Luxury Hillside Villa": { guests: 8, bedrooms: 4, beds: 5, bathrooms: 4 },
  "Minimalist Dome with Stargazing": { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
  "Sun-drenched Beach Villa": { guests: 8, bedrooms: 4, beds: 5, bathrooms: 4 },
  "Rustic Farm Stay & Dairy": { guests: 6, bedrooms: 3, beds: 3, bathrooms: 2 },
  "Royal Palace View Suite": { guests: 3, bedrooms: 1, beds: 2, bathrooms: 1.5 },
  "Pine Forest Glamping Pod": { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
  "Modern Oasis with Private Pool": { guests: 10, bedrooms: 5, beds: 6, bathrooms: 4 },
  "Historic French Colony Suite": { guests: 3, bedrooms: 1, beds: 2, bathrooms: 1 },
  "Sunset Cliffside Cottage": { guests: 4, bedrooms: 2, beds: 2, bathrooms: 2 },
  "Himalayan Stone Cottage": { guests: 4, bedrooms: 2, beds: 3, bathrooms: 2 },
  "Contemporary Glass Penthouse": { guests: 6, bedrooms: 3, beds: 3, bathrooms: 2.5 },
  "Organic Vineyard Guest House": { guests: 6, bedrooms: 3, beds: 4, bathrooms: 3 },
  "Riverside Bamboo Eco-Lodge": { guests: 4, bedrooms: 2, beds: 2, bathrooms: 1.5 },
  "Sea-Facing Luxury Villa in Bandra": { guests: 10, bedrooms: 5, beds: 6, bathrooms: 5 },
  "Art Deco Penthouse near Marine Drive": { guests: 8, bedrooms: 4, beds: 4, bathrooms: 3 },
  "Tropical Beachfront Haven in Juhu": { guests: 8, bedrooms: 4, beds: 5, bathrooms: 4 },
  "Chic Designer Studio in Colaba": { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
  "Skyline Glass Villa at Worli Sea Face": { guests: 10, bedrooms: 5, beds: 6, bathrooms: 5 },
};

module.exports = {
  data: sampleListings.map((listing) => ({
    ...listing,
    ...(capacityByTitle[listing.title] || {}),
  })),
  capacityByTitle,
};
