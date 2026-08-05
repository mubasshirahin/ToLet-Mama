import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  PhoneCall,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { LISTINGS, getListingById } from "../data/listings";

const FAVORITES_KEY = "toletmama.favorites.v1";

function readFavorites() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function ListingDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const listing = useMemo(() => {
    const baseListing = getListingById(id);
    const routeListing = location.state?.listing;

    if (!baseListing && !routeListing) {
      return null;
    }

    if (!routeListing) {
      return baseListing;
    }

    return {
      ...baseListing,
      ...routeListing,
      images: routeListing.images?.length
        ? routeListing.images
        : baseListing?.images || (routeListing.image ? [routeListing.image] : []),
    };
  }, [id, location.state]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => readFavorites());
  const [toast, setToast] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  useEffect(() => {
    writeFavorites(favorites);
  }, [favorites]);

  const isFavorite = listing ? favorites.includes(listing.id) : false;

  const relatedListings = useMemo(() => {
    if (!listing) return [];
    return LISTINGS.filter((item) => item.id !== listing.id && (item.type === listing.type || item.location.split(",")[1] === listing.location.split(",")[1])).slice(0, 4);
  }, [listing]);

  const handleFavorite = () => {
    if (!listing) return;
    setFavorites((current) =>
      current.includes(listing.id)
        ? current.filter((value) => value !== listing.id)
        : [...current, listing.id]
    );
    setToast(isFavorite ? "Removed from saved" : "Added to saved");
    window.setTimeout(() => setToast(""), 1600);
  };

  const handleShare = async () => {
    if (!listing) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setToast("Link copied");
        window.setTimeout(() => setToast(""), 1600);
      }
    } catch {
      setToast("Share cancelled");
      window.setTimeout(() => setToast(""), 1600);
    }
  };

  if (isLoading) {
    return <ListingSkeleton />;
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#FAF3E0] px-4 py-10 text-[#2C1810]">
        <div className="mx-auto max-w-3xl border-2 border-[#5C3A21]/20 bg-white p-8 text-center">
          <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
            Listing not found
          </p>
          <h1 className="mt-3 font-serif text-3xl font-black">We could not find that property.</h1>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-rubber-stamp mt-6 justify-center px-5 py-3 text-sm"
          >
            Back home
          </button>
        </div>
      </div>
    );
  }

  const activeImage = listing.images[activeImageIndex] || listing.image;

  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#2C1810]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,58,33,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(44,24,16,0.08),transparent_24%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-4 border-2 border-[#5C3A21]/20 bg-white p-4 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/"
              className="mb-3 inline-flex items-center gap-2 font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880] transition-colors hover:text-[#2C1810]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Back to home
            </Link>
            <h1 className="font-serif text-3xl font-black tracking-tight sm:text-4xl">
              Listing Detail Page
            </h1>
            <p className="mt-1 font-serif text-sm text-[#5C3A21]">
              {listing.location} • {listing.type} • {listing.status}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border-2 border-[#2C1810] bg-[#FAF3E0] px-3 py-2 font-serif text-xs font-bold uppercase tracking-[0.15em]">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              {listing.price}
            </span>
            <button
              type="button"
              onClick={handleFavorite}
              className={`btn-coupon-clip px-4 py-2 text-[10px] ${isFavorite ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]" : ""}`}
            >
              <Bookmark className="h-4 w-4" strokeWidth={1.8} />
              {isFavorite ? "Saved" : "Save"}
            </button>
            <button type="button" onClick={handleShare} className="btn-coupon-clip px-4 py-2 text-[10px]">
              <Share2 className="h-4 w-4" strokeWidth={1.8} />
              Share
            </button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-6">
            <div className="border-2 border-[#5C3A21]/20 bg-white p-4 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                    Image gallery
                  </p>
                  <h2 className="font-serif text-xl font-black">Working image viewer</h2>
                </div>
                <span className="rounded-full border border-[#5C3A21]/20 px-3 py-1 font-serif text-[10px] uppercase tracking-[0.15em] text-[#5C3A21]">
                  {activeImageIndex + 1}/{listing.images.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="halftone-overlay relative block w-full overflow-hidden border-2 border-[#2C1810] bg-[#F4E8C1]"
              >
                <img src={activeImage} alt={listing.title} className="h-[320px] w-full object-cover sm:h-[420px]" />
                <span className="absolute left-3 top-3 border-2 border-[#2C1810] bg-[#FAF3E0] px-3 py-1 font-serif text-[10px] font-bold uppercase tracking-[0.15em]">
                  Tap to enlarge
                </span>
              </button>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {listing.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`halftone-overlay overflow-hidden border-2 transition-all ${
                      activeImageIndex === index ? "border-[#2C1810] shadow-[3px_3px_0px_rgba(44,24,16,0.12)]" : "border-[#5C3A21]/20 hover:border-[#2C1810]"
                    }`}
                  >
                    <img src={image} alt={`${listing.title} thumbnail ${index + 1}`} className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
              <div className="border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-6">
                <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                  Property information
                </p>
                <h2 className="mt-2 font-serif text-2xl font-black tracking-tight">{listing.title}</h2>
                <p className="mt-3 font-serif text-sm leading-relaxed text-[#5C3A21]">{listing.description}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {listing.highlights.map((item) => (
                    <div key={item} className="border border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-2 font-serif text-sm font-bold">
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <InfoPill icon={BedDouble} label="Bedrooms" value={listing.specs.bedrooms} />
                  <InfoPill icon={Bath} label="Bathrooms" value={listing.specs.bathrooms} />
                  <InfoPill icon={Clock3} label="Size" value={listing.specs.size} />
                  <InfoPill icon={CalendarDays} label="Available from" value={listing.availableFrom} />
                </div>

                <div className="mt-6">
                  <h3 className="font-serif text-lg font-black">Amenities</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {listing.amenities.map((amenity) => (
                      <span key={amenity} className="border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-1 font-serif text-xs font-bold uppercase tracking-[0.12em] text-[#5C3A21]">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="font-serif text-lg font-black">House rules</h3>
                    <ul className="mt-3 space-y-2 font-serif text-sm text-[#5C3A21]">
                      {listing.rules.map((rule) => (
                        <li key={rule} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-black">Nearby places</h3>
                    <ul className="mt-3 space-y-2 font-serif text-sm text-[#5C3A21]">
                      {listing.nearby.map((place) => (
                        <li key={place} className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
                          {place}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-6">
                  <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                    Owner contact card
                  </p>
                  <div className="mt-4 flex items-center gap-4 border-b-2 border-[#2C1810] pb-4">
                    <img
                      src={listing.owner.avatar}
                      alt={listing.owner.name}
                      className="h-16 w-16 rounded-full border-2 border-[#2C1810] object-cover"
                    />
                    <div>
                      <h3 className="font-serif text-xl font-black">{listing.owner.name}</h3>
                      <p className="font-serif text-sm text-[#5C3A21]">
                        {listing.owner.role}
                        {listing.owner.verified ? " • Verified" : ""}
                      </p>
                      <div className="mt-1 flex items-center gap-1 font-serif text-xs text-[#5C3A21]">
                        <Star className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
                        4.9 response rate
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 font-serif text-sm text-[#5C3A21]">
                    <ContactRow icon={PhoneCall} label="Phone" value={listing.owner.phone} />
                    <ContactRow icon={MessageCircle} label="Email" value={listing.owner.email} />
                    <ContactRow icon={Clock3} label="Response" value={listing.owner.response} />
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={`tel:${listing.owner.phone.replace(/\s+/g, "")}`}
                      className="btn-rubber-stamp justify-center px-5 py-3 text-sm"
                    >
                      Call owner
                    </a>
                    <a
                      href={`mailto:${listing.owner.email}`}
                      className="btn-coupon-clip justify-center px-5 py-3 text-[10px]"
                    >
                      Message owner
                    </a>
                  </div>
                </div>

                <div className="border-2 border-[#5C3A21]/20 bg-[#2C1810] p-5 text-[#FAF3E0] shadow-[4px_4px_0px_rgba(44,24,16,0.08)] sm:p-6">
                  <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#F4E8C1]/80">
                    Quick facts
                  </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <FactCard label="Status" value={listing.status} />
                    <FactCard label="Interests" value={`${listing.interested} people`} />
                    <FactCard label="Posted" value={listing.posted} />
                    <FactCard label="Type" value={listing.type} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#F4E8C1]/20 bg-[#FAF3E0]/10 px-4 py-3 font-serif text-sm text-[#F4E8C1]">
                    <Users className="h-4 w-4" strokeWidth={1.8} />
                    {listing.interested} people showed interest
                  </div>
                </div>

                {toast && (
                  <div className="border-2 border-[#2C1810] bg-white px-4 py-3 font-serif text-sm font-bold">
                    {toast}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-6">
              <div className="flex items-center justify-between border-b-2 border-[#2C1810] pb-4">
                <div>
                  <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                    At a glance
                  </p>
                  <h2 className="font-serif text-xl font-black">Property summary</h2>
                </div>
                <span className={`border-2 px-3 py-1 font-serif text-[10px] font-bold uppercase tracking-[0.15em] ${listing.status === "Available" ? "border-[#2C1810] bg-[#FAF3E0] text-[#2C1810]" : "border-[#5C3A21] bg-[#2C1810] text-[#FAF3E0]"}`}>
                  {listing.status}
                </span>
              </div>

              <div className="mt-5 space-y-4 font-serif text-sm">
                <SummaryRow label="Price" value={listing.price} />
                <SummaryRow label="Location" value={listing.location} />
                <SummaryRow label="Type" value={listing.type} />
                <SummaryRow label="Floor" value={listing.specs.floor} />
              </div>
            </div>

            <div className="border-2 border-[#5C3A21]/20 bg-white p-5 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:p-6">
              <div className="flex items-center justify-between border-b-2 border-[#2C1810] pb-4">
                <div>
                  <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                    Related listings
                  </p>
                  <h2 className="font-serif text-xl font-black">More options</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("related-strip");
                      el?.scrollBy({ left: -300, behavior: "smooth" });
                    }}
                    className="border-2 border-[#5C3A21]/20 p-2 text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("related-strip");
                      el?.scrollBy({ left: 300, behavior: "smooth" });
                    }}
                    className="border-2 border-[#5C3A21]/20 p-2 text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div id="related-strip" className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {relatedListings.map((item) => (
                  <Link
                    key={item.id}
                    to={`/listings/${item.id}`}
                    className="group w-[220px] shrink-0 border border-[#5C3A21]/20 bg-[#FAF3E0] transition-transform hover:-translate-y-1"
                  >
                    <img src={item.image} alt={item.title} className="h-32 w-full object-cover sepia-[30%]" />
                    <div className="p-4">
                      <h3 className="font-serif text-sm font-black text-[#2C1810]">{item.title}</h3>
                      <p className="mt-1 font-serif text-xs text-[#5C3A21]">{item.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1810]/85 px-4 py-6"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden border-2 border-[#FAF3E0] bg-[#FAF3E0]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute right-3 top-3 z-10 border-2 border-[#2C1810] bg-[#FAF3E0] p-2 text-[#2C1810]"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
              <img src={activeImage} alt={listing.title} className="max-h-[90vh] w-full object-contain bg-black" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF3E0] px-4 py-6 text-[#2C1810] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 animate-pulse border-2 border-[#5C3A21]/20 bg-white p-4">
          <div className="h-3 w-32 bg-[#5C3A21]/10" />
          <div className="mt-4 h-9 w-2/3 bg-[#5C3A21]/10" />
          <div className="mt-3 h-4 w-1/2 bg-[#5C3A21]/10" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-4">
              <div className="h-4 w-36 bg-[#5C3A21]/10" />
              <div className="mt-4 h-[320px] bg-[#5C3A21]/10 sm:h-[420px]" />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 bg-[#5C3A21]/10" />
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
              <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-5 sm:p-6">
                <div className="h-4 w-32 bg-[#5C3A21]/10" />
                <div className="mt-4 h-8 w-2/3 bg-[#5C3A21]/10" />
                <div className="mt-4 h-20 bg-[#5C3A21]/10" />
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-10 bg-[#5C3A21]/10" />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-5 sm:p-6">
                  <div className="h-4 w-28 bg-[#5C3A21]/10" />
                  <div className="mt-4 h-24 bg-[#5C3A21]/10" />
                  <div className="mt-4 h-10 bg-[#5C3A21]/10" />
                </div>
                <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-5 sm:p-6">
                  <div className="h-4 w-32 bg-[#5C3A21]/10" />
                  <div className="mt-4 h-32 bg-[#5C3A21]/10" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-5 sm:p-6">
              <div className="h-4 w-24 bg-[#5C3A21]/10" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-6 bg-[#5C3A21]/10" />
                ))}
              </div>
            </div>
            <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-5 sm:p-6">
              <div className="h-4 w-32 bg-[#5C3A21]/10" />
              <div className="mt-4 h-48 bg-[#5C3A21]/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="border border-[#5C3A21]/20 bg-[#FAF3E0] p-3">
      <div className="flex items-center gap-2 font-serif text-[10px] uppercase tracking-[0.16em] text-[#A89880]">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        {label}
      </div>
      <p className="mt-1 font-serif text-sm font-bold text-[#2C1810]">{value}</p>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-b border-[#5C3A21]/10 pb-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#A89880]" strokeWidth={1.8} />
      <div>
        <p className="font-serif text-[10px] uppercase tracking-[0.16em] text-[#A89880]">{label}</p>
        <p className="font-serif text-sm font-bold text-[#2C1810]">{value}</p>
      </div>
    </div>
  );
}

function FactCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#F4E8C1]/20 bg-[#FAF3E0]/10 p-3">
      <p className="font-serif text-[10px] uppercase tracking-[0.18em] text-[#F4E8C1]/70">{label}</p>
      <p className="mt-1 font-serif text-sm font-bold text-[#FAF3E0]">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[#5C3A21]/10 pb-2">
      <span className="font-serif text-[10px] font-bold uppercase tracking-[0.16em] text-[#A89880]">{label}</span>
      <span className="font-serif text-sm font-bold text-[#2C1810]">{value}</span>
    </div>
  );
}

export default ListingDetailPage;
