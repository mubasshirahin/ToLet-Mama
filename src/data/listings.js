export const LISTINGS = [
  {
    id: 1,
    title: "Bachelor Room near BUET Campus",
    price: "BDT 8,500/mo",
    location: "Palashi, Dhaka",
    type: "Room",
    status: "Available",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1560448204?w=1200&h=900&fit=crop",
    ],
    description:
      "Single bachelor room close to BUET with ceiling fan, shared bathroom, and 24-hour water supply. Perfect for male students on a tight budget.",
    highlights: ["Near BUET", "Ceiling fan included", "24hr water"],
    specs: { bedrooms: 1, bathrooms: 1, size: "120 sq ft", floor: "3rd floor" },
    amenities: ["Wi-Fi", "Water supply", "Security guard", "Ceiling fan"],
    rules: ["Male tenants only", "No smoking", "No overnight guests"],
    nearby: ["BUET - 5 min walk", "Palashi intersection - 3 min", "Local canteen - 2 min"],
    availableFrom: "August 18, 2026",
    posted: "2 days ago",
    interested: 18,
    owner: {
      name: "Abdul Karim",
      role: "Owner",
      phone: "+880 1712 345678",
      email: "karim@toletmama.test",
      response: "Usually replies within 30 minutes",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    },
  },
  {
    id: 2,
    title: "Shared Flat near DU Arts Faculty",
    price: "BDT 6,000/mo",
    location: "New Market, Dhaka",
    type: "Shared Room",
    status: "Available",
    image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=900&fit=crop",
    ],
    description:
      "Shared flat in New Market area, 2 students per room. Walking distance to Dhaka University Arts Faculty. Bills split equally among tenants.",
    highlights: ["Near DU campus", "Shared bills", "Food stalls nearby"],
    specs: { bedrooms: 2, bathrooms: 1, size: "280 sq ft", floor: "2nd floor" },
    amenities: ["Wi-Fi", "Water supply", "Ceiling fan", "Study desk"],
    rules: ["Male tenants only", "Quiet hours after 11 PM", "No cooking in room"],
    nearby: ["DU Arts Faculty - 7 min", "New Market - 4 min", "Curzon Hall - 10 min"],
    availableFrom: "September 1, 2026",
    posted: "5 days ago",
    interested: 22,
    owner: {
      name: "Sharmin Akhter",
      role: "Owner",
      phone: "+880 1811 223344",
      email: "sharmin@toletmama.test",
      response: "Usually replies within 1 hour",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    },
  },
  {
    id: 3,
    title: "Female Student Room - Bashundhara",
    price: "BDT 7,500/mo",
    location: "Bashundhara R/A, Dhaka",
    type: "Room",
    status: "Booked",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=900&fit=crop",
    ],
    description:
      "Secure female-only room in Bashundhara with attached bathroom, hot water geyser, and separate entry. Near NSU and ISB.",
    highlights: ["Female only", "Attached bathroom", "Geyser"],
    specs: { bedrooms: 1, bathrooms: 1, size: "150 sq ft", floor: "4th floor" },
    amenities: ["Wi-Fi", "Security guard", "Water supply", "Geyser", "Study desk"],
    rules: ["Female tenants only", "No smoking", "Parents can visit weekends"],
    nearby: ["NSU - 10 min", "ISB - 8 min", "Jamuna Future Park - 12 min"],
    availableFrom: "September 10, 2026",
    posted: "1 week ago",
    interested: 34,
    owner: {
      name: "Mubasshir Rahin",
      role: "Owner",
      phone: "+880 1901 112233",
      email: "mubasshir@toletmama.test",
      response: "Usually replies within 20 minutes",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    },
  },
  {
    id: 4,
    title: "Bachelor Flat near KUET",
    price: "BDT 5,000/mo",
    location: "Khulna Sadar, Khulna",
    type: "Flat",
    status: "Available",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&h=900&fit=crop",
    ],
    description:
      "Budget-friendly flat for 2 bachelor students near KUET. Shared kitchen, clean water, and a quiet neighborhood for focused study.",
    highlights: ["Near KUET", "Shared kitchen", "Quiet area"],
    specs: { bedrooms: 1, bathrooms: 1, size: "200 sq ft", floor: "2nd floor" },
    amenities: ["Water supply", "Ceiling fan", "Natural light", "Balcony"],
    rules: ["Male tenants only", "No loud music", "6-month minimum stay"],
    nearby: ["KUET - 6 min walk", "Khulna Station - 15 min", "Medical college - 8 min"],
    availableFrom: "August 24, 2026",
    posted: "3 days ago",
    interested: 11,
    owner: {
      name: "Nadia Karim",
      role: "Owner",
      phone: "+880 1722 998877",
      email: "nadia@toletmama.test",
      response: "Usually replies within 45 minutes",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    },
  },
  {
    id: 5,
    title: "Single Room for SUST Student",
    price: "BDT 4,500/mo",
    location: "Mirpur 10, Dhaka",
    type: "Room",
    status: "Available",
    image: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=900&fit=crop",
    ],
    description:
      "Tiny but clean single room in Mirpur 10, ideal for budget-conscious students. Metro rail access within walking distance. Owner lives upstairs.",
    highlights: ["Metro rail nearby", "Owner on-site", "Budget friendly"],
    specs: { bedrooms: 1, bathrooms: 1, size: "100 sq ft", floor: "5th floor" },
    amenities: ["Water supply", "Ceiling fan", "Security", "Natural light"],
    rules: ["Male tenants only", "No smoking", "Entry by 11 PM"],
    nearby: ["Mirpur 10 metro - 4 min", "Local market - 3 min", "BUET - 20 min by metro"],
    availableFrom: "August 12, 2026",
    posted: "1 day ago",
    interested: 41,
    owner: {
      name: "Sohan Islam",
      role: "Owner",
      phone: "+880 1788 445566",
      email: "sohan@toletmama.test",
      response: "Usually replies within 15 minutes",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    },
  },
  {
    id: 6,
    title: "Furnished Room near BUET - Banani",
    price: "BDT 12,000/mo",
    location: "Banani 11, Dhaka",
    type: "Room",
    status: "Pending",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&h=900&fit=crop",
    ],
    description:
      "Furnished bachelor room in Banani with bed, wardrobe, and study table. One of the best locations for students at BUET and AIUB. Lift and generator backup.",
    highlights: ["Fully furnished", "Lift available", "Generator backup"],
    specs: { bedrooms: 1, bathrooms: 1, size: "180 sq ft", floor: "7th floor" },
    amenities: ["Lift", "Generator", "Wi-Fi", "Geyser", "Ceiling fan", "Security"],
    rules: ["No pets", "No smoking", "12-month lease preferred"],
    nearby: ["BUET - 12 min", "AIUB - 10 min", "Banani 11 market - 3 min"],
    availableFrom: "September 5, 2026",
    posted: "4 days ago",
    interested: 9,
    owner: {
      name: "Arif Hossain",
      role: "Owner",
      phone: "+880 1766 554433",
      email: "arif@toletmama.test",
      response: "Usually replies within 2 hours",
      verified: false,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    },
  },
  {
    id: 7,
    title: "Two Sharing Room - Science Lab, SUST",
    price: "BDT 3,800/mo",
    location: "Sylhet Sadar, Sylhet",
    type: "Shared Room",
    status: "Available",
    image: "https://images.unsplash.com/photo-1598928506311?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1598928506311?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&h=900&fit=crop",
    ],
    description:
      "Affordable two-sharing room for SUST students. Shared kitchen with gas stove, free Wi-Fi, and a 5-minute walk to the Science Lab gate.",
    highlights: ["Near SUST", "Free Wi-Fi", "Shared kitchen"],
    specs: { bedrooms: 1, bathrooms: 1, size: "160 sq ft", floor: "1st floor" },
    amenities: ["Wi-Fi", "Water supply", "Ceiling fan", "Kitchen"],
    rules: ["Male tenants only", "No overnight guests", "Kitchen shared by 4"],
    nearby: ["SUST Science Lab - 5 min", "Zindabazar - 8 min", "Sylhet airport - 25 min"],
    availableFrom: "August 20, 2026",
    posted: "6 hours ago",
    interested: 15,
    owner: {
      name: "Rafiq Uddin",
      role: "Owner",
      phone: "+880 1755 332211",
      email: "rafiq@toletmama.test",
      response: "Usually replies within 1 hour",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    },
  },
  {
    id: 8,
    title: "Single Room near RUET Campus",
    price: "BDT 4,000/mo",
    location: "Rajshahi Sadar, Rajshahi",
    type: "Room",
    status: "Available",
    image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1598928506311?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=900&fit=crop",
    ],
    description:
      "Basic single room near Rajshahi University of Engineering and Technology. Tile floor, ceiling fan, and reliable electricity. Great for focused students.",
    highlights: ["Near RUET", "Reliable electricity", "Tile floor"],
    specs: { bedrooms: 1, bathrooms: 1, size: "130 sq ft", floor: "2nd floor" },
    amenities: ["Water supply", "Ceiling fan", "Security", "Natural light"],
    rules: ["Male tenants only", "No smoking", "Visitors allowed till 9 PM"],
    nearby: ["RUET - 8 min walk", "Rajshahi Railway - 12 min", "Shaheb Bazar - 10 min"],
    availableFrom: "August 25, 2026",
    posted: "3 hours ago",
    interested: 7,
    owner: {
      name: "Jamal Mia",
      role: "Owner",
      phone: "+880 1733 887766",
      email: "jamal@toletmama.test",
      response: "Usually replies within 2 hours",
      verified: true,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    },
  },
];

export function getListingSummary(listing) {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    location: listing.location,
    type: listing.type,
    status: listing.status,
    image: listing.image,
    posted: listing.posted,
    interested: listing.interested,
  };
}

const LISTING_STORAGE_KEY = "toletmama.savedListings.v1";

function readStoredListings() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LISTING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredListings(listings) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(listings));
  } catch {
    // Ignore storage failures so the form still works normally.
  }
}

export function getAllListings() {
  const savedListings = readStoredListings();
  const savedIds = new Set(savedListings.map((listing) => listing.id));

  return [...savedListings, ...LISTINGS.filter((listing) => !savedIds.has(listing.id))];
}

export function getListingById(id) {
  const numericId = Number(id);
  return getAllListings().find((listing) => listing.id === numericId) || null;
}

export function upsertListing(listing) {
  const savedListings = readStoredListings();
  const nextListing = { ...listing };
  const existingIndex = savedListings.findIndex((item) => item.id === nextListing.id);

  if (existingIndex >= 0) {
    const nextListings = [...savedListings];
    nextListings[existingIndex] = nextListing;
    writeStoredListings(nextListings);
    return nextListing;
  }

  writeStoredListings([nextListing, ...savedListings]);
  return nextListing;
}

export function createListingId() {
  const allIds = getAllListings().map((listing) => listing.id);
  return (allIds.length ? Math.max(...allIds) : 0) + 1;
}

export function deleteListing(id) {
  const numericId = Number(id);
  const nextListings = readStoredListings().filter((listing) => listing.id !== numericId);
  writeStoredListings(nextListings);
}
