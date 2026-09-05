export const LISTINGS = [];

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

// No localStorage for listings — all data is server-side via backend API
function readStoredListings() {
  return [];
}

function writeStoredListings() {
  // No-op: drafts and listings are persisted via backend /my/draft and /listings
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
