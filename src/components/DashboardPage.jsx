import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutGrid,
  List,
  LogOut,
  MapPin,
  Menu,
  Mail,
  Newspaper,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { getAllListings } from "../data/listings";

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

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = location.state?.role || "Student";
  const listings = useMemo(() => getAllListings(), []);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchParams.get("q") ?? "");

  const sidebarLinks = [
    { icon: Search, label: "Browse Listings", active: true },
    { icon: Mail, label: "Messages", route: "/messages" },
    { icon: Bell, label: "Notifications" },
    { icon: User, label: "Profile", route: "/profile" },
    { icon: Settings, label: "Settings" },
  ];

  useEffect(() => {
    setSearchDraft(searchParams.get("q") ?? "");
  }, [searchParams.toString()]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        const value = searchDraft.trim();
        if (value) {
          next.set("q", value);
        } else {
          next.delete("q");
        }
        return next;
      }, { replace: true });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchDraft, setSearchParams]);

  const catalogOptions = useMemo(() => {
    const types = [...new Set(listings.map((listing) => listing.type))].sort();
    const locations = [...new Set(listings.map((listing) => getArea(listing.location)))].sort();
    const amenities = [...new Set(listings.flatMap((listing) => listing.amenities || []))].sort();
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
    { label: "Total Listings", value: listings.length.toLocaleString(), change: "+12%", up: true },
    { label: "Active Chats", value: role === "Owner" ? "34" : "8", change: "+5%", up: true },
    { label: "Saved Properties", value: "12", change: "", up: true },
    { label: "Monthly Visits", value: role === "Owner" ? "47" : "3", change: "+18%", up: true },
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
        case "0-5000":
          return price < 5000;
        case "5000-10000":
          return price >= 5000 && price < 10000;
        case "10000-20000":
          return price >= 10000 && price < 20000;
        case "20000-plus":
          return price >= 20000;
        default:
          return true;
      }
    };

    const matchesSearch = (listing) => {
      if (!searchTerm) return true;
      const haystack = [
        listing.title,
        listing.location,
        listing.type,
        listing.status,
        listing.description,
        listing.owner?.name,
        ...(listing.amenities || []),
        ...(listing.highlights || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchTerm);
    };

    const matchesType = (listing) => filters.type === "any" || listing.type === filters.type;
    const matchesLocation = (listing) => filters.location === "any" || getArea(listing.location) === filters.location;
    const matchesAmenities = (listing) => {
      if (selectedAmenities.size === 0) return true;
      const available = new Set(listing.amenities || []);
      return [...selectedAmenities].every((amenity) => available.has(amenity));
    };

    const results = listings.filter(
      (listing) =>
        matchesSearch(listing) &&
        matchesPriceBand(listing) &&
        matchesType(listing) &&
        matchesLocation(listing) &&
        matchesAmenities(listing)
    );

    const sortedResults = [...results].sort((a, b) => {
      switch (filters.sort) {
        case "price-low":
          return getPriceValue(a.price) - getPriceValue(b.price);
        case "price-high":
          return getPriceValue(b.price) - getPriceValue(a.price);
        case "newest":
          return b.id - a.id;
        case "interested":
          return b.interested - a.interested;
        default:
          return a.id - b.id;
      }
    });

    return sortedResults;
  }, [filters, listings]);

  const updateSearchParams = (patch, options = {}) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          next.delete(key);
          return;
        }

        if (Array.isArray(value)) {
          next.set(key, value.join(","));
          return;
        }

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
    const nextAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((item) => item !== amenity)
      : [...filters.amenities, amenity];
    updateSearchParams({ amenities: nextAmenities });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
    setSearchDraft("");
    setMobileFiltersOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#FAF3E0] text-[#2C1810]">
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-[#2C1810]/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r-2 border-[#5C3A21]/20 bg-[#FAF3E0] transition-transform lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b-2 border-[#2C1810] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#2C1810]">
              <Newspaper className="h-5 w-5 text-[#FAF3E0]" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-lg font-black uppercase tracking-tight text-[#2C1810]">
              The Gazette
            </span>
          </div>
          <p className="mt-1 font-serif text-[9px] uppercase tracking-[0.15em] text-[#5C3A21]">
            {role}&apos;s Dashboard - Vol. IV
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          {sidebarLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => {
                if (link.route) {
                  navigate(link.route, { state: { role } });
                }
              }}
              disabled={!link.route}
              className={`flex w-full items-center gap-3 px-4 py-3 font-serif text-sm font-bold uppercase tracking-[0.1em] transition-all ${
                link.active
                  ? "bg-[#2C1810] text-[#FAF3E0] -translate-y-px shadow-[2px_2px_0px_0px_rgba(44,24,16,0.2)]"
                  : link.route
                    ? "text-[#5C3A21] hover:bg-[#F4E8C1] hover:text-[#2C1810]"
                    : "cursor-default text-[#5C3A21]/50"
              }`}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.5} />
              {link.label}
            </button>
          ))}
        </nav>

        <div className="border-t-2 border-[#5C3A21]/20 p-4">
          <div className="flex items-center gap-3 border-2 border-[#5C3A21]/20 bg-[#F4E8C1] p-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#2C1810] font-serif text-sm font-bold text-[#FAF3E0]">
              {role === "Student" ? "RS" : "SA"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-sm font-bold text-[#2C1810]">
                {role === "Student" ? "Rafsan Islam" : "Sharmin Akhter"}
              </p>
              <p className="truncate font-serif text-[10px] uppercase tracking-[0.15em] text-[#5C3A21]">
                {role}
              </p>
            </div>
            <button className="text-[#5C3A21] transition-colors hover:text-[#2C1810]">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b-2 border-[#5C3A21]/20 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <button
                className="p-2 text-[#5C3A21] transition-colors hover:bg-[#F4E8C1] lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <div>
                <h1 className="font-serif text-lg font-black text-[#2C1810]">
                  Welcome, {role === "Student" ? "Rafsan" : "Sharmin"}
                </h1>
                <p className="font-serif text-[10px] uppercase tracking-[0.15em] text-[#5C3A21]">
                  {new Date().toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-[#5C3A21] transition-colors hover:bg-[#F4E8C1] hover:text-[#2C1810]">
                <Bell className="h-5 w-5" strokeWidth={1.5} />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center bg-[#2C1810] text-[10px] font-bold text-[#FAF3E0]">
                  3
                </span>
              </button>
              <div className="flex h-9 w-9 items-center justify-center border-2 border-[#5C3A21]/30 bg-[#E8D5A3] font-serif text-sm font-bold text-[#2C1810]">
                {role === "Student" ? "RS" : "SA"}
              </div>
            </div>
          </div>

          <div className="border-t border-[#5C3A21]/10 px-6 py-1">
            <p className="font-serif text-[9px] uppercase tracking-[0.2em] text-[#A89880]">
              Edition: Daily | Dhaka, Bangladesh
            </p>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <div className="mb-8 grid gap-px border-2 border-[#5C3A21]/20 bg-[#5C3A21]/20 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#FAF3E0] p-5">
                <p className="mb-1 font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                  {stat.label}
                </p>
                <div className="flex items-end justify-between">
                  <p className="font-serif text-3xl font-black text-[#2C1810]">{stat.value}</p>
                  {stat.change && (
                    <span
                      className={`font-serif text-xs font-bold uppercase tracking-[0.1em] ${
                        stat.up ? "text-[#2C1810]" : "text-[#A89880]"
                      }`}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-px bg-gradient-to-r from-[#2C1810] to-transparent opacity-20" />
              </div>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-black tracking-tight text-[#2C1810]">
                Browse Listings
              </h2>
              <p className="font-serif text-sm text-[#5C3A21]">
                {role === "Owner"
                  ? "Search, sort, and manage your listings with URL-synced filters."
                  : "Search verified rooms and apartments with quick filters by price, area, and amenities."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="btn-coupon-clip px-4 py-2 text-[10px] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters {activeFilterCount ? `(${activeFilterCount})` : ""}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="btn-coupon-clip px-4 py-2 text-[10px]"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
              {role === "Owner" && (
                <Link to="/listings/new" className="btn-rubber-stamp px-5 py-2 text-xs">
                  + Add Listing
                </Link>
              )}
            </div>
          </div>

          <hr className="news-rule mb-8" />

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
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
              />
            </aside>

            <section className="min-w-0 space-y-5">
              <div className="border-2 border-[#5C3A21]/20 bg-white p-4 shadow-[4px_4px_0px_rgba(44,24,16,0.05)]">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_160px]">
                  <label className="flex items-center gap-3 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3">
                    <Search className="h-4 w-4 text-[#A89880]" strokeWidth={1.8} />
                    <input
                      value={searchDraft}
                      onChange={(event) => setSearchDraft(event.target.value)}
                      placeholder="Search by keyword, area, owner, or amenity"
                      className="w-full bg-transparent font-serif text-sm text-[#2C1810] outline-none placeholder:text-[#A89880]"
                    />
                  </label>

                  <label className="flex items-center gap-3 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3">
                    <span className="font-serif text-[10px] font-bold uppercase tracking-[0.14em] text-[#5C3A21]">
                      Sort
                    </span>
                    <div className="relative flex-1">
                      <select
                        value={filters.sort}
                        onChange={(event) => setSort(event.target.value)}
                        className="w-full appearance-none bg-transparent font-serif text-sm text-[#2C1810] outline-none"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A89880]" strokeWidth={1.8} />
                    </div>
                  </label>

                  <div className="flex items-center justify-between border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-2">
                    <span className="font-serif text-[10px] font-bold uppercase tracking-[0.14em] text-[#5C3A21]">
                      View
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setView("grid")}
                        className={`flex h-9 w-9 items-center justify-center border transition-colors ${
                          filters.view === "grid"
                            ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                            : "border-[#5C3A21]/20 text-[#5C3A21] hover:border-[#2C1810] hover:text-[#2C1810]"
                        }`}
                        aria-label="Grid view"
                      >
                        <LayoutGrid className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("list")}
                        className={`flex h-9 w-9 items-center justify-center border transition-colors ${
                          filters.view === "list"
                            ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                            : "border-[#5C3A21]/20 text-[#5C3A21] hover:border-[#2C1810] hover:text-[#2C1810]"
                        }`}
                        aria-label="List view"
                      >
                        <List className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {filters.q && <ActiveFilterChip label={`Search: ${filters.q}`} onClear={() => setSearchDraft("")} />}
                  {filters.price !== "any" && (
                    <ActiveFilterChip label={`Price: ${getBandLabel(filters.price)}`} onClear={() => setPrice("any")} />
                  )}
                  {filters.type !== "any" && (
                    <ActiveFilterChip label={`Type: ${filters.type}`} onClear={() => setType("any")} />
                  )}
                  {filters.location !== "any" && (
                    <ActiveFilterChip label={`Location: ${filters.location}`} onClear={() => setLocation("any")} />
                  )}
                  {filters.amenities.map((amenity) => (
                    <ActiveFilterChip
                      key={amenity}
                      label={amenity}
                      onClear={() => toggleAmenity(amenity)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="font-serif text-xs uppercase tracking-[0.18em] text-[#A89880]">
                  Showing {filteredListings.length} of {listings.length} listings
                </p>
                <p className="font-serif text-xs uppercase tracking-[0.18em] text-[#A89880]">
                  {activeFilterCount ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} active` : "No active filters"}
                </p>
              </div>

              {filteredListings.length === 0 ? (
                <EmptyResultsState onClear={clearFilters} />
              ) : filters.view === "list" ? (
                <div className="space-y-4">
                  {filteredListings.map((listing) => (
                    <ListingListCard
                      key={listing.id}
                      listing={listing}
                      statusStyles={statusStyles}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredListings.map((listing) => (
                    <ListingGridCard
                      key={listing.id}
                      listing={listing}
                      statusStyles={statusStyles}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="mt-10 border-t-2 border-[#5C3A21]/20 pt-6">
            <div className="flex items-center justify-between font-serif text-[10px] uppercase tracking-[0.15em] text-[#A89880]">
              <span>&copy; 2026 The Daily Gazette - All rights reserved.</span>
              <span>Est. 2022</span>
            </div>
          </div>
        </div>
      </main>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-[#2C1810]/50 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div
            className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l-2 border-[#5C3A21]/20 bg-[#FAF3E0] p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                  Filters
                </p>
                <h3 className="font-serif text-2xl font-black">Refine results</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="border-2 border-[#5C3A21]/20 p-2 text-[#5C3A21]"
              >
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
              <button type="button" onClick={clearFilters} className="btn-coupon-clip flex-1 justify-center px-4 py-3 text-[10px]">
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-rubber-stamp flex-1 justify-center px-4 py-3 text-[10px]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ListingFilters({
  filters,
  searchDraft,
  setSearchDraft,
  priceBands,
  types,
  locations,
  amenities,
  onPriceChange,
  onTypeChange,
  onLocationChange,
  onSortChange,
  onToggleAmenity,
  onClear,
  compact = false,
}) {
  return (
    <div className={`border-2 border-[#5C3A21]/20 bg-white shadow-[4px_4px_0px_rgba(44,24,16,0.05)] ${compact ? "p-0 shadow-none" : "p-4"}`}>
      <div className={`${compact ? "p-0" : ""}`}>
        {!compact && (
          <div className="mb-4 flex items-center justify-between border-b-2 border-[#2C1810] pb-4">
            <div>
              <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                Filter panel
              </p>
              <h3 className="font-serif text-xl font-black">Browse controls</h3>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="border-2 border-[#5C3A21]/20 px-3 py-2 font-serif text-[10px] font-bold uppercase tracking-[0.14em] text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
            >
              Clear all
            </button>
          </div>
        )}

        <div className={compact ? "space-y-4" : "space-y-5"}>
          <FilterGroup title="Keyword search" compact={compact}>
            <label className="flex items-center gap-3 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3">
              <Search className="h-4 w-4 text-[#A89880]" strokeWidth={1.8} />
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search anything"
                className="w-full bg-transparent font-serif text-sm text-[#2C1810] outline-none placeholder:text-[#A89880]"
              />
            </label>
          </FilterGroup>

          <FilterGroup title="Price" compact={compact}>
            <select
              value={filters.price}
              onChange={(event) => onPriceChange(event.target.value)}
              className="w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none"
            >
              {priceBands.map((band) => (
                <option key={band.value} value={band.value}>
                  {band.label}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup title="Type" compact={compact}>
            <select
              value={filters.type}
              onChange={(event) => onTypeChange(event.target.value)}
              className="w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none"
            >
              <option value="any">Any type</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup title="Location" compact={compact}>
            <select
              value={filters.location}
              onChange={(event) => onLocationChange(event.target.value)}
              className="w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none"
            >
              <option value="any">Any location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup title="Amenities" compact={compact}>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => onToggleAmenity(amenity)}
                    className={`border-2 px-3 py-2 font-serif text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                      active
                        ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                        : "border-[#5C3A21]/20 bg-[#FAF3E0] text-[#5C3A21] hover:border-[#2C1810] hover:text-[#2C1810]"
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          <FilterGroup title="Sort" compact={compact}>
            <select
              value={filters.sort}
              onChange={(event) => onSortChange(event.target.value)}
              className="w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterGroup>

          {!compact && (
            <button
              type="button"
              onClick={onClear}
              className="btn-rubber-stamp w-full justify-center px-5 py-3 text-sm"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children, compact = false }) {
  return (
    <div className={compact ? "" : "border-b border-[#5C3A21]/10 pb-4 last:border-0 last:pb-0"}>
      <p className="mb-2 font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
        {title}
      </p>
      {children}
    </div>
  );
}

function ActiveFilterChip({ label, onClear }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-2 border border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-1.5 font-serif text-[10px] font-bold uppercase tracking-[0.14em] text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
    >
      <span>{label}</span>
      <X className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}

function ListingGridCard({ listing, statusStyles }) {
  return (
    <Link
      to={`/listings/${listing.id}`}
      state={{ listing }}
      className="group border-2 border-[#5C3A21]/20 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#2C1810]"
    >
      <div className="halftone-overlay relative h-48 overflow-hidden border-b-2 border-[#5C3A21]/20">
        <img
          src={listing.image}
          alt={listing.title}
          className="h-full w-full object-cover sepia-[40%] contrast-[1.05] transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 border-2 px-2.5 py-1 font-serif text-[9px] font-bold uppercase tracking-[0.12em] ${statusStyles[listing.status]}`}
        >
          {listing.status}
        </span>
        <span className="absolute bottom-3 right-3 border-2 border-[#2C1810] bg-[#FAF3E0] px-2.5 py-1 font-serif text-sm font-bold text-[#2C1810]">
          {listing.price}
        </span>
      </div>

      <div className="p-5">
        <h3 className="mb-1 font-serif text-base font-bold text-[#2C1810] group-hover:text-[#2C1810]">
          {listing.title}
        </h3>
        <div className="mb-3 flex items-center gap-1 font-serif text-xs text-[#5C3A21]">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          {listing.location}
        </div>
        <div className="flex items-center justify-between border-t-2 border-[#5C3A21]/10 pt-3">
          <span className="border border-[#5C3A21]/20 px-2.5 py-0.5 font-serif text-[10px] font-bold uppercase tracking-[0.1em] text-[#5C3A21]">
            {listing.type}
          </span>
          <div className="flex items-center gap-1 font-serif text-[10px] text-[#5C3A21]">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
            {listing.interested} interested
          </div>
        </div>
      </div>
    </Link>
  );
}

function ListingListCard({ listing, statusStyles }) {
  return (
    <Link
      to={`/listings/${listing.id}`}
      state={{ listing }}
      className="group grid overflow-hidden border-2 border-[#5C3A21]/20 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#2C1810] md:grid-cols-[220px_minmax(0,1fr)]"
    >
      <div className="halftone-overlay relative min-h-56 overflow-hidden border-b-2 border-[#5C3A21]/20 md:min-h-full md:border-b-0 md:border-r-2">
        <img
          src={listing.image}
          alt={listing.title}
          className="h-full w-full object-cover sepia-[35%] contrast-[1.05] transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 border-2 px-2.5 py-1 font-serif text-[9px] font-bold uppercase tracking-[0.12em] ${statusStyles[listing.status]}`}
        >
          {listing.status}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-black text-[#2C1810]">{listing.title}</h3>
            <div className="mt-2 flex items-center gap-1 font-serif text-sm text-[#5C3A21]">
              <MapPin className="h-4 w-4" strokeWidth={1.5} />
              {listing.location}
            </div>
          </div>
          <span className="border-2 border-[#2C1810] bg-[#FAF3E0] px-3 py-1 font-serif text-sm font-bold text-[#2C1810]">
            {listing.price}
          </span>
        </div>

        <p className="mt-3 max-w-3xl font-serif text-sm leading-relaxed text-[#5C3A21]">
          {listing.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(listing.amenities || []).slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="border border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-1 font-serif text-[10px] font-bold uppercase tracking-[0.12em] text-[#5C3A21]"
            >
              {amenity}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#5C3A21]/10 pt-4">
          <div className="flex items-center gap-3">
            <span className="border border-[#5C3A21]/20 px-2.5 py-0.5 font-serif text-[10px] font-bold uppercase tracking-[0.1em] text-[#5C3A21]">
              {listing.type}
            </span>
            <span className="font-serif text-[10px] uppercase tracking-[0.14em] text-[#A89880]">
              Posted {listing.posted}
            </span>
          </div>
          <div className="flex items-center gap-1 font-serif text-[10px] text-[#5C3A21]">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
            {listing.interested} interested
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyResultsState({ onClear }) {
  return (
    <div className="border-2 border-[#5C3A21]/20 bg-white p-8 text-center shadow-[4px_4px_0px_rgba(44,24,16,0.05)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#5C3A21]/20 bg-[#FAF3E0]">
        <Sparkles className="h-7 w-7 text-[#A89880]" strokeWidth={1.6} />
      </div>
      <h3 className="mt-5 font-serif text-2xl font-black text-[#2C1810]">
        No listings match these filters.
      </h3>
      <p className="mx-auto mt-2 max-w-md font-serif text-sm text-[#5C3A21]">
        Try broadening the price range, removing a few amenities, or clearing the filters to see the full catalog.
      </p>
      <button type="button" onClick={onClear} className="btn-rubber-stamp mt-6 px-5 py-3 text-sm">
        Clear filters
      </button>
    </div>
  );
}

function getArea(location) {
  return (location || "").split(",")[0].trim();
}

function getPriceValue(price) {
  const numeric = String(price || "").replace(/[^\d]/g, "");
  return Number(numeric || 0);
}

function getBandLabel(value) {
  return PRICE_BANDS.find((band) => band.value === value)?.label || value;
}

export default DashboardPage;
