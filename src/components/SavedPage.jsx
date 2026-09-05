import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, Sparkles, Users } from "lucide-react";
import { fetchFavorites, fetchListing, toggleFavorite } from "../lib/api";

const SAVED_IDS_KEY = "toletmama.saved_ids";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1522708323590?w=1200&h=900&fit=crop";

function readSavedIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_IDS_KEY) || "[]").map(String); } catch { return []; }
}

function writeSavedIds(ids) {
  try { localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(ids)); } catch {}
}

function normalizeListing(listing) {
  return {
    ...listing,
    image: listing.images?.[0] || listing.image || FALLBACK_IMAGE,
    status: listing.status ? listing.status.charAt(0).toUpperCase() + listing.status.slice(1) : "Available",
    interested: listing.interested ?? 0,
  };
}

export default function SavedPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("toletmama.api_token")) {
      navigate("/auth", { replace: true });
      return;
    }
    let cancelled = false;
    fetchFavorites()
      .then(async (res) => {
        const ids = (res.saved_ids || []).map(String);
        writeSavedIds(ids);
        const savedListings = await Promise.all(ids.map((id) => fetchListing(id).catch(() => null)));
        if (!cancelled) setListings(savedListings.filter(Boolean).map(normalizeListing));
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [navigate]);

  const handleRemove = async (listingId) => {
    const id = String(listingId);
    const previous = listings;
    setListings((current) => current.filter((listing) => String(listing.id) !== id));
    const nextIds = readSavedIds().filter((value) => value !== id);
    writeSavedIds(nextIds);
    try {
      await toggleFavorite(listingId);
    } catch {
      setListings(previous);
      writeSavedIds([...nextIds, id]);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">Your shortlist</p>
          <h1 className="font-serif text-3xl font-black text-[#2C1810]">Saved listings</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5C3A21]">Keep the rooms and apartments you want to come back to close at hand.</p>
        </div>
        <Link to="/dashboard" className="btn-rubber-stamp self-start px-5 py-2.5 text-xs sm:self-auto">Browse listings</Link>
      </div>

      {isLoading ? (
        <div className="glass-pane rounded-3xl p-12 text-center text-sm text-[#A89880]">Loading your saved listings...</div>
      ) : listings.length === 0 ? (
        <div className="glass-pane rounded-3xl p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F4E8C1]">
            <Heart className="h-9 w-9 text-[#5C3A21]" strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 font-serif text-2xl font-black text-[#2C1810]">No saved listings yet.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#5C3A21]">Tap the heart on a listing you like and it will stay here for your next visit.</p>
          <Link to="/dashboard" className="btn-rubber-stamp mt-8 inline-flex px-6 py-3 text-sm">Find a place</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <article key={listing.id} className="group relative flex flex-col overflow-hidden rounded-2xl glass-pane transition-transform duration-300 hover:-translate-y-1.5">
              <Link to={`/listings/${listing.id}`} state={{ listing }}>
                <div className="relative h-52 overflow-hidden border-b-2 border-[#5C3A21]/20">
                  <img src={listing.image} alt={listing.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute left-3 top-3 border-2 border-[#2C1810] bg-[#FAF3E0] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#2C1810]">{listing.status}</span>
                </div>
                <div className="p-5">
                  <h2 className="font-serif text-lg font-black leading-snug text-[#2C1810]">{listing.title}</h2>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-[#5C3A21]"><MapPin className="h-3.5 w-3.5" /><span className="truncate">{listing.location}</span></div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#5C3A21]">{listing.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t-2 border-[#5C3A21]/10 pt-3">
                    <span className="font-serif text-lg font-black text-[#2C1810]">{listing.price}</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5C3A21]"><Users className="h-3.5 w-3.5" />{listing.interested}</span>
                  </div>
                </div>
              </Link>
              <button type="button" aria-label="Remove from saved listings" onClick={() => handleRemove(listing.id)} className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center border-2 border-[#2C1810] bg-[#2C1810] text-[#FAF3E0] shadow-[2px_2px_0px_rgba(44,24,16,0.15)] hover:-translate-y-0.5"><Heart className="h-4 w-4" fill="currentColor" /></button>
            </article>
          ))}
        </div>
      )}

      {!isLoading && listings.length > 0 && <p className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#A89880]"><Sparkles className="h-3.5 w-3.5" /> {listings.length} saved {listings.length === 1 ? "listing" : "listings"}</p>}
    </div>
  );
}