import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  LayoutGrid,
  List,
  MapPin,
  Mail,
  Newspaper,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { fetchDashboardStats, fetchListings, getCurrentUser } from "../lib/api";
import { LISTINGS } from "../data/listings";

const PRICE_BANDS = [
  { value: "any", label: "Any price" },
  { value: "0-5000", label: "Under BDT 5,000" },
  { value: "5000-10000", label: "BDT 5,000 - 10,000" },
  { value: "10000-20000", label: "BDT 10,000 - 20,000" },
  { value: "20000-plus", label: "BDT 20,000+" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "interested", label: "Most interested" },
];

/* ═══════════════════════════════════════════
   ANIMATED COUNTER HOOK (odometer roll-up)
   ═══════════════════════════════════════════ */
function useAnimatedCounter(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const num = parseInt(target, 10) || 0;
    if (num === 0) { setDisplay(0); return; }
    if (hasAnimated.current) { setDisplay(num); return; }

    let start = null;
    let raf;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.floor(eased * num));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  // Trigger animation when element enters viewport
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { display, ref };
}

/* ═══════════════════════════════════════════
   3D TILT CARD COMPONENT
   ═══════════════════════════════════════════ */
function TiltCard({ children, className = "", intensity = 15, glareEnabled = true, ...props }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scrolling = useRef(false);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 300,
    damping: 30,
  });

  const glareX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });
  const glareOpacity = useSpring(useTransform(y, [-0.5, 0.5], [0.15, 0.05]), { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || scrolling.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  useEffect(() => {
    let timeout;
    const onScroll = () => {
      scrolling.current = true;
      x.set(0);
      y.set(0);
      clearTimeout(timeout);
      timeout = setTimeout(() => { scrolling.current = false; }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(timeout); };
  }, [x, y]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY }}
      className={`card-3d ${className}`}
      {...props}
    >
      {children}
      {glareEnabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{
            background: useTransform(
              [glareX, glareOpacity],
              ([gx, go]) =>
                `linear-gradient(115deg, transparent 30%, rgba(212,175,55,${go}) ${gx}%, transparent ${gx + 20}%)`
            ),
          }}
        />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════ */

/* Stagger animation variants */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95, rotateX: 8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { type: "spring", stiffness: 240, damping: 22 },
  },
};

const cardStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.3 },
  },
};

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = location.state?.role || "Student";
  const [listings, setListings] = useState(() =>
    LISTINGS.map((l) => ({
      ...l,
      image: l.images?.[0] || "",
      status: l.status ? l.status.charAt(0).toUpperCase() + l.status.slice(1) : "Available",
    }))
  );
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [dashStats, setDashStats] = useState({ total_listings: 0, active_chats: 0, saved_properties: 0, monthly_visits: 0 });
  const [isAuthed, setIsAuthed] = useState(() => !!localStorage.getItem("toletmama.api_token"));

  useEffect(() => {
    if (!localStorage.getItem("toletmama.api_token")) {
      navigate("/auth", { replace: true });
      return;
    }
    let cancelled = false;
    getCurrentUser()
      .then(() => { if (!cancelled) setIsAuthed(true); })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem("toletmama.api_token");
          localStorage.removeItem("toletmama.api_user");
          navigate("/auth", { replace: true });
        }
      });
    return () => { cancelled = true; };
  }, [navigate]);

  useEffect(() => {
    if (!isAuthed) return;
    let cancelled = false;
    setIsLoadingListings(true);
    fetchListings({ page: 1 })
      .then((res) => {
        if (!cancelled) {
          const raw = res.data || [];
          setListings(raw.length > 0 ? raw.map(normalizeListing) : LISTINGS.map(normalizeListing));
        }
      })
      .catch(() => {
        if (!cancelled) setListings(LISTINGS.map(normalizeListing));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingListings(false);
      });
    return () => { cancelled = true; };
  }, [isAuthed]);


  useEffect(() => {
    if (!isAuthed) return;
    let cancelled = false;
    fetchDashboardStats()
      .then((res) => { if (!cancelled) setDashStats(res); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isAuthed]);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const urlQuery = searchParams.get("q") ?? "";
  const [searchDraft, setSearchDraft] = useState(urlQuery);

  useEffect(() => { setSearchDraft(urlQuery); }, [urlQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        const value = searchDraft.trim();
        if (value) next.set("q", value);
        else next.delete("q");
        return next;
      }, { replace: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, setSearchParams]);

  const catalogOptions = useMemo(() => {
    const types = [...new Set(listings.map((l) => l.type))].sort();
    const locations = [...new Set(listings.map((l) => getArea(l.location)))].sort();
    const amenities = [...new Set(listings.flatMap((l) => l.amenities || []))].sort();
    return { types, locations, amenities };
  }, [listings]);

  const filters = useMemo(() => {
    const amenities = searchParams.get("amenities");
    return {
      q: searchParams.get("q") ?? "",
      price: searchParams.get("price") ?? "any",
      type: searchParams.get("type") ?? "any",
      location: searchParams.get("loc") ?? "any",
      amenities: amenities ? amenities.split(",").filter(Boolean) : [],
      sort: searchParams.get("sort") ?? "relevance",
      view: searchParams.get("view") === "list" ? "list" : "grid",
    };
  }, [searchParams]);

  const activeFilterCount =
    (filters.q ? 1 : 0) +
    (filters.price !== "any" ? 1 : 0) +
    (filters.type !== "any" ? 1 : 0) +
    (filters.location !== "any" ? 1 : 0) +
    filters.amenities.length +
    (filters.sort !== "relevance" ? 1 : 0) +
    (filters.view !== "grid" ? 1 : 0);

  const stats = [
    { label: "Total Listings", raw: dashStats.total_listings || listings.length, icon: Newspaper },
    { label: "Active Chats", raw: dashStats.active_chats || 0, icon: Mail },
    { label: "Saved Properties", raw: dashStats.saved_properties || 0, icon: Sparkles },
    { label: "Monthly Visits", raw: dashStats.monthly_visits || 0, icon: Users },
  ];

  const statusStyles = {
    Available: "border-[#2C1810] bg-[#FAF3E0] text-[#2C1810]",
    Booked: "border-[#5C3A21] bg-[#2C1810] text-[#FAF3E0]",
    Pending: "border-[#A89880] bg-[#FAF3E0] text-[#5C3A21]",
  };

  const filteredListings = useMemo(() => {
    const searchTerm = filters.q.trim().toLowerCase();
    const selectedAmenities = new Set(filters.amenities);
    const matchesPriceBand = (listing) => {
      const price = getPriceValue(listing.price);
      switch (filters.price) {
        case "0-5000": return price < 5000;
        case "5000-10000": return price >= 5000 && price < 10000;
        case "10000-20000": return price >= 10000 && price < 20000;
        case "20000-plus": return price >= 20000;
        default: return true;
      }
    };
    const matchesSearch = (listing) => {
      if (!searchTerm) return true;
      const haystack = [listing.title, listing.location, listing.type, listing.status, listing.description, listing.owner?.name, ...(listing.amenities || []), ...(listing.highlights || [])].join(" ").toLowerCase();
      return haystack.includes(searchTerm);
    };
    const matchesType = (listing) => filters.type === "any" || listing.type === filters.type;
    const matchesLocation = (listing) => filters.location === "any" || getArea(listing.location) === filters.location;
    const matchesAmenities = (listing) => {
      if (selectedAmenities.size === 0) return true;
      const available = new Set(listing.amenities || []);
      return [...selectedAmenities].every((a) => available.has(a));
    };
    const results = listings.filter((l) => matchesSearch(l) && matchesPriceBand(l) && matchesType(l) && matchesLocation(l) && matchesAmenities(l));
    return [...results].sort((a, b) => {
      switch (filters.sort) {
        case "price-low": return getPriceValue(a.price) - getPriceValue(b.price);
        case "price-high": return getPriceValue(b.price) - getPriceValue(a.price);
        case "newest": return b.id - a.id;
        case "interested": return b.interested - a.interested;
        default: return a.id - b.id;
      }
    });
  }, [filters, listings]);

  const updateSearchParams = (patch, options = {}) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          next.delete(key);
          return;
        }
        if (Array.isArray(value)) { next.set(key, value.join(",")); return; }
        next.set(key, String(value));
      });
      return next;
    }, { replace: options.replace ?? true });
  };

  const setPrice = (value) => updateSearchParams({ price: value === "any" ? "" : value });
  const setType = (value) => updateSearchParams({ type: value === "any" ? "" : value });
  const setLocation = (value) => updateSearchParams({ loc: value === "any" ? "" : value });
  const setSort = (value) => updateSearchParams({ sort: value === "relevance" ? "" : value });
  const setView = (value) => updateSearchParams({ view: value === "grid" ? "" : value });
  const toggleAmenity = (amenity) => {
    const next = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    updateSearchParams({ amenities: next });
  };
  const clearFilters = () => {
    setSearchParams({}, { replace: true });
    setSearchDraft("");
    setMobileFiltersOpen(false);
  };


  return (
      <div className="p-6 lg:p-8">
        {/* ═══ STAT CARDS ═══ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </motion.div>

          {/* ═══ BROWSE HEADER ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 24 }}
            className="mb-6 flex flex-col gap-4 glass-pane rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">
                {role === "Owner" ? "Property Management" : "Property Search"}
              </p>
              <h2 className="font-serif text-2xl font-black tracking-tight text-[#2C1810]">Browse Listings</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#5C3A21]">
                {role === "Owner"
                  ? "Search, sort, and manage your listings with URL-synced filters."
                  : "Search verified rooms and apartments with quick filters by price, area, and amenities."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <motion.button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                whileTap={{ scale: 0.97, y: 2 }}
                className="btn-coupon-clip px-4 py-2 text-xs lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters {activeFilterCount ? `(${activeFilterCount})` : ""}
              </motion.button>
              <motion.button
                type="button"
                onClick={clearFilters}
                whileTap={{ scale: 0.97, y: 2 }}
                className="btn-coupon-clip px-4 py-2 text-xs"
              >
                <X className="h-4 w-4" />
                Clear
              </motion.button>
              {role === "Owner" && (
                <motion.div whileTap={{ scale: 0.97, y: 2 }} className="inline-flex">
                  <Link to="/listings/new" className="btn-rubber-stamp px-5 py-2 text-xs">
                    + Add Listing
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ═══ FILTERS + LISTINGS ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <section className="min-w-0 space-y-5">
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 24 }}
                className="glass-pane rounded-2xl p-4"
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_160px]">
                  <label className="search-focus-ring flex items-center gap-3 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 transition-all duration-300 focus-within:border-[#2C1810] focus-within:shadow-[2px_2px_0px_rgba(44,24,16,0.1)]">
                    <Search className="h-4 w-4 text-[#A89880]" strokeWidth={1.8} />
                    <input
                      value={searchDraft}
                      onChange={(e) => setSearchDraft(e.target.value)}
                      placeholder="Search by keyword, area, owner, or amenity"
                      className="w-full bg-transparent text-sm text-[#2C1810] outline-none placeholder:text-[#A89880]"
                    />
                    {searchDraft && (
                      <button type="button" onClick={() => setSearchDraft("")} className="text-[#A89880] hover:text-[#2C1810]">
                        <X className="h-4 w-4" strokeWidth={2} />
                      </button>
                    )}
                  </label>
                  <label className="flex items-center gap-3 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#5C3A21]">Sort</span>
                    <div className="relative flex-1">
                      <select
                        value={filters.sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full appearance-none bg-transparent text-sm font-medium text-[#2C1810] outline-none"
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A89880]" strokeWidth={1.8} />
                    </div>
                  </label>
                  <div className="flex items-center justify-between border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-2">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#5C3A21]">View</span>
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        type="button"
                        onClick={() => setView("grid")}
                        whileTap={{ scale: 0.9 }}
                        className={`flex h-8 w-8 items-center justify-center border transition-all ${
                          filters.view === "grid"
                            ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0] shadow-[2px_2px_0px_rgba(44,24,16,0.2)]"
                            : "border-[#5C3A21]/20 text-[#5C3A21] hover:border-[#2C1810] hover:text-[#2C1810]"
                        }`}
                        aria-label="Grid view"
                      >
                        <LayoutGrid className="h-4 w-4" strokeWidth={1.8} />
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setView("list")}
                        whileTap={{ scale: 0.9 }}
                        className={`flex h-8 w-8 items-center justify-center border transition-all ${
                          filters.view === "list"
                            ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0] shadow-[2px_2px_0px_rgba(44,24,16,0.2)]"
                            : "border-[#5C3A21]/20 text-[#5C3A21] hover:border-[#2C1810] hover:text-[#2C1810]"
                        }`}
                        aria-label="List view"
                      >
                        <List className="h-4 w-4" strokeWidth={1.8} />
                      </motion.button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {filters.q && <ActiveFilterChip label={`Search: ${filters.q}`} onClear={() => setSearchDraft("")} />}
                  {filters.price !== "any" && <ActiveFilterChip label={`Price: ${getBandLabel(filters.price)}`} onClear={() => setPrice("any")} />}
                  {filters.type !== "any" && <ActiveFilterChip label={`Type: ${filters.type}`} onClear={() => setType("any")} />}
                  {filters.location !== "any" && <ActiveFilterChip label={`Location: ${filters.location}`} onClear={() => setLocation("any")} />}
                  {filters.amenities.map((a) => (
                    <ActiveFilterChip key={a} label={a} onClear={() => toggleAmenity(a)} />
                  ))}
                </div>
              </motion.div>

              {/* Results count */}
              <div className="flex items-center justify-between gap-3 rounded-sm border border-[#5C3A21]/10 bg-[#FAF3E0]/50 px-4 py-2.5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5C3A21]">
                  Showing {filteredListings.length} of {listings.length} listings
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#A89880]">
                  {activeFilterCount ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active` : "No filters"}
                </p>
              </div>

              {/* Listing Grid / List */}
              <AnimatePresence mode="wait">
                {filteredListings.length === 0 ? (
                  <EmptyResultsState key="empty" onClear={clearFilters} />
                ) : filters.view === "list" ? (
                  <div key="list" className="space-y-4">
                    {filteredListings.map((listing, i) => (
                      <ListingListCard key={listing.id} listing={listing} statusStyles={statusStyles} index={i} />
                    ))}
                  </div>
                ) : (
                  <div key="grid" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredListings.map((listing, i) => (
                      <ListingGridCard key={listing.id} listing={listing} statusStyles={statusStyles} index={i} />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </section>
          </motion.div>

          {/* Footer */}
          <div className="mt-12 border-t pt-6" style={{ borderColor: "var(--theme-border)" }}>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-[#A89880]">
              <span>&copy; 2026 The Daily Gazette — All rights reserved.</span>
              <span>Est. 2022</span>
            </div>
          </div>

        {/* ═══ MOBILE FILTERS PANEL ═══ */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#2C1810]/50 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l-2 border-[#5C3A21]/20 bg-[#FAF3E0] p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#A89880]">Filters</p>
                    <h3 className="font-serif text-2xl font-black">Refine results</h3>
                  </div>
                  <button type="button" onClick={() => setMobileFiltersOpen(false)} className="border-2 border-[#5C3A21]/20 p-2 text-[#5C3A21]">
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
                <ListingFilters
                  filters={filters}
                  searchDraft={searchDraft}
                  setSearchDraft={setSearchDraft}
                  priceBands={PRICE_BANDS}
                  types={catalogOptions.types}
                  locations={catalogOptions.locations}
                  amenities={catalogOptions.amenities}
                  onPriceChange={setPrice}
                  onTypeChange={setType}
                  onLocationChange={setLocation}
                  onSortChange={setSort}
                  onToggleAmenity={toggleAmenity}
                  onClear={clearFilters}
                  compact
                />
                <div className="mt-4 flex gap-3">
                  <motion.button type="button" onClick={clearFilters} whileTap={{ scale: 0.97, y: 2 }} className="btn-coupon-clip flex-1 justify-center px-4 py-3 text-xs">
                    Clear
                  </motion.button>
                  <motion.button type="button" onClick={() => setMobileFiltersOpen(false)} whileTap={{ scale: 0.97, y: 2 }} className="btn-rubber-stamp flex-1 justify-center px-4 py-3 text-xs">
                    Apply
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STAT CARD WITH 3D TILT + ANIMATED COUNTER
   ═══════════════════════════════════════════ */
function StatCard({ stat }) {
  const { display, ref } = useAnimatedCounter(stat.raw);

  return (
    <motion.div variants={statCardVariants}>
      <TiltCard
        intensity={12}
        className="group relative glass-pane rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 gold-glow overflow-hidden"
      >
        <div className="shimmer-overlay" />
        <div className="relative z-[6] card-3d-inner">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center border border-[#5C3A21]/20 bg-[#FAF3E0]">
              <stat.icon className="h-5 w-5 text-[#5C3A21]" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A89880]">{stat.label}</p>
          <p ref={ref} className="mt-1 font-serif text-3xl font-black text-[#2C1810]">
            {display.toLocaleString()}
          </p>
          <div className="mt-3 h-px bg-gradient-to-r from-[#2C1810] via-[#5C3A21]/20 to-transparent" />
        </div>
      </TiltCard>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   FILTER COMPONENTS
   ═══════════════════════════════════════════ */
function ListingFilters({
  filters, searchDraft, setSearchDraft, priceBands, types, locations, amenities,
  onPriceChange, onTypeChange, onLocationChange, onSortChange, onToggleAmenity, onClear, compact = false,
}) {
  return (
    <div className={`border-2 border-[#5C3A21]/20 bg-white shadow-[4px_4px_0px_rgba(44,24,16,0.05)] ${compact ? "p-0 shadow-none" : "p-4"}`}>
      <div className={compact ? "p-0" : ""}>
        {!compact && (
          <div className="mb-4 flex items-center justify-between border-b-2 border-[#2C1810] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A89880]">Filter panel</p>
              <h3 className="font-serif text-xl font-black">Browse controls</h3>
            </div>
            <motion.button
              type="button"
              onClick={onClear}
              whileTap={{ scale: 0.97 }}
              className="border-2 border-[#5C3A21]/20 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
            >
              Clear all
            </motion.button>
          </div>
        )}
        <div className={compact ? "space-y-4" : "space-y-5"}>
          <FilterGroup title="Keyword search" compact={compact}>
            <label className="flex items-center gap-3 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3">
              <Search className="h-4 w-4 text-[#A89880]" strokeWidth={1.8} />
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search anything"
                className="w-full bg-transparent text-sm text-[#2C1810] outline-none placeholder:text-[#A89880]"
              />
            </label>
          </FilterGroup>
          <FilterGroup title="Price" compact={compact}>
            <select value={filters.price} onChange={(e) => onPriceChange(e.target.value)} className="w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 text-sm text-[#2C1810] outline-none">
              {priceBands.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </FilterGroup>
          <FilterGroup title="Type" compact={compact}>
            <select value={filters.type} onChange={(e) => onTypeChange(e.target.value)} className="w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 text-sm text-[#2C1810] outline-none">
              <option value="any">Any type</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FilterGroup>
          <FilterGroup title="Location" compact={compact}>
            <select value={filters.location} onChange={(e) => onLocationChange(e.target.value)} className="w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 text-sm text-[#2C1810] outline-none">
              <option value="any">Any location</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </FilterGroup>
          <FilterGroup title="Amenities" compact={compact}>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <motion.button
                    key={amenity}
                    type="button"
                    onClick={() => onToggleAmenity(amenity)}
                    whileTap={{ scale: 0.95 }}
                    className={`border-2 px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                        : "border-[#5C3A21]/20 bg-[#FAF3E0] text-[#5C3A21] hover:border-[#2C1810] hover:text-[#2C1810]"
                    }`}
                  >
                    {amenity}
                  </motion.button>
                );
              })}
            </div>
          </FilterGroup>
          <FilterGroup title="Sort" compact={compact}>
            <select value={filters.sort} onChange={(e) => onSortChange(e.target.value)} className="w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 text-sm text-[#2C1810] outline-none">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FilterGroup>
          {!compact && (
            <motion.button type="button" onClick={onClear} whileTap={{ scale: 0.97, y: 2 }} className="btn-rubber-stamp w-full justify-center px-5 py-3 text-sm">
              Reset filters
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children, compact = false }) {
  return (
    <div className={compact ? "" : "border-b border-[#5C3A21]/10 pb-4 last:border-0 last:pb-0"}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#A89880]">{title}</p>
      {children}
    </div>
  );
}

function ActiveFilterChip({ label, onClear }) {
  return (
    <motion.button
      type="button"
      onClick={onClear}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-1.5 border-2 border-[#2C1810]/20 bg-[#FAF3E0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#5C3A21] transition-all hover:border-[#2C1810] hover:bg-[#2C1810] hover:text-[#FAF3E0]"
    >
      <span>{label}</span>
      <X className="h-3 w-3" strokeWidth={2.5} />
    </motion.button>
  );
}

/* ═══════════════════════════════════════════
   PROPERTY CARDS WITH 3D + SHIMMER
   ═══════════════════════════════════════════ */
function ListingGridCard({ listing, statusStyles, index = 0 }) {
  return (
    <TiltCard
        intensity={10}
        className="group relative flex flex-col glass-pane rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 gold-glow"
      >
        <Link to={`/listings/${listing.id}`} state={{ listing }} className="contents">
          <div className="halftone-overlay relative h-52 overflow-hidden border-b-2 border-[#5C3A21]/20">
            <img
              src={listing.image}
              alt={listing.title}
              className="h-full w-full object-cover sepia-[30%] contrast-[1.05] brightness-[0.95] transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/20 via-transparent to-transparent" />
            <div className="shimmer-overlay" />
            <span
              className={`badge-float absolute left-3 top-3 border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusStyles[listing.status]}`}
            >
              {listing.status}
            </span>
            <span
              className="badge-float absolute bottom-3 right-3 border-2 border-[#2C1810] bg-[#FAF3E0] px-3 py-1.5 font-serif text-sm font-black text-[#2C1810] shadow-[2px_2px_0px_rgba(44,24,16,0.15)]"
            >
              {listing.price}
            </span>
          </div>

          <div className="relative z-[6] card-3d-inner flex flex-1 flex-col p-5">
            <h3 className="font-serif text-lg font-black leading-snug text-[#2C1810] transition-colors group-hover:text-[#5C3A21]">
              {listing.title}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-[#5C3A21]">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
              <span className="truncate font-medium">{listing.location}</span>
            </div>
            <p className="mt-2.5 flex-1 line-clamp-2 text-sm leading-relaxed text-[#5C3A21]">
              {listing.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(listing.amenities || []).slice(0, 3).map((amenity) => (
                <span key={amenity} className="border border-[#5C3A21]/15 bg-[#FAF3E0] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#5C3A21]">
                  {amenity}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t-2 border-[#5C3A21]/10 pt-3">
              <span className="border-2 border-[#5C3A21]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#5C3A21]">
                {listing.type}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C3A21]">
                <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                {listing.interested}
              </div>
            </div>
          </div>
        </Link>
      </TiltCard>
  );
}

function ListingListCard({ listing, statusStyles, index = 0 }) {
  return (
    <TiltCard
      intensity={6}
        className="group relative grid overflow-hidden glass-pane rounded-2xl transition-all duration-300 hover:-translate-y-0.5 md:grid-cols-[240px_minmax(0,1fr)] gold-glow"
      >
        <Link to={`/listings/${listing.id}`} state={{ listing }} className="contents">
          <div className="halftone-overlay relative min-h-56 overflow-hidden border-b-2 border-[#5C3A21]/20 md:min-h-full md:border-b-0 md:border-r-2">
            <img
              src={listing.image}
              alt={listing.title}
              className="h-full w-full object-cover sepia-[25%] contrast-[1.05] brightness-[0.95] transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#2C1810]/10" />
            <div className="shimmer-overlay" />
            <span className={`badge-float absolute left-3 top-3 border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusStyles[listing.status]}`}>
              {listing.status}
            </span>
          </div>

          <div className="relative z-[6] card-3d-inner flex flex-col p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-black leading-snug text-[#2C1810] transition-colors group-hover:text-[#5C3A21]">
                  {listing.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-[#5C3A21]">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {listing.location}
                </div>
              </div>
              <span className="badge-float border-2 border-[#2C1810] bg-[#FAF3E0] px-3.5 py-1.5 font-serif text-sm font-black text-[#2C1810] shadow-[2px_2px_0px_rgba(44,24,16,0.12)]">
                {listing.price}
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5C3A21]">{listing.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(listing.amenities || []).slice(0, 4).map((amenity) => (
                <span key={amenity} className="border border-[#5C3A21]/15 bg-[#FAF3E0] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#5C3A21]">
                  {amenity}
                </span>
              ))}
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#5C3A21]/10 pt-4">
              <div className="flex items-center gap-3">
                <span className="border-2 border-[#5C3A21]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#5C3A21]">
                  {listing.type}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89880]">
                  Posted {listing.posted}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C3A21]">
                <Users className="h-3.5 w-3.5" strokeWidth={1.8} />
                {listing.interested}
              </div>
            </div>
          </div>
        </Link>
      </TiltCard>
  );
}

/* ═══════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════ */
function EmptyResultsState({ onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="glass-pane rounded-3xl p-10 text-center"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "var(--theme-surface-2)" }}
      >
        <Sparkles className="h-9 w-9 text-[#A89880]" strokeWidth={1.4} />
      </motion.div>
      <h3 className="mt-6 font-serif text-2xl font-black text-[#2C1810]">
        No listings match these filters.
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#5C3A21]">
        Try broadening the price range, removing a few amenities, or clearing the filters to see the full catalog.
      </p>
      <motion.button
        type="button"
        onClick={onClear}
        whileTap={{ scale: 0.97, y: 2 }}
        className="btn-rubber-stamp mt-8 px-6 py-3 text-sm"
      >
        Clear all filters
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1522708323590?w=1200&h=900&fit=crop";

function normalizeListing(raw) {
  const image = Array.isArray(raw.images) && raw.images.length ? raw.images[0] : raw.image || FALLBACK_IMAGE;
  const owner = raw.user
    ? { name: raw.user.name || "Unknown", role: "Owner", phone: raw.user.phone || "", email: raw.user.email || "", response: "Usually replies within 1 hour", verified: true, avatar: raw.user.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" }
    : raw.owner || { name: "Unknown", role: "Owner", phone: "", email: "", response: "", verified: false, avatar: "" };
  const capitalizedStatus = raw.status ? raw.status.charAt(0).toUpperCase() + raw.status.slice(1) : "Available";
  const posted = raw.posted || (raw.created_at ? timeAgo(new Date(raw.created_at)) : "Recently");
  return {
    ...raw, image,
    images: Array.isArray(raw.images) ? raw.images : raw.image ? [raw.image] : [FALLBACK_IMAGE],
    owner, status: capitalizedStatus, posted,
    interested: raw.interested ?? 0,
  };
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getArea(location) { return (location || "").split(",")[0].trim(); }
function getPriceValue(price) { const n = String(price || "").replace(/[^\d]/g, ""); return Number(n || 0); }
function getBandLabel(value) { return PRICE_BANDS.find((b) => b.value === value)?.label || value; }

export default DashboardPage;
