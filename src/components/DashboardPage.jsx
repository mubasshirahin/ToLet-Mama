import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Newspaper, Search, Mail, Bell, User, Settings, LogOut, Menu, MapPin, Users } from "lucide-react";

const dummyListings = [
  {
    id: 1,
    title: "Modern Studio near BUET Campus",
    location: "Palashi, Dhaka",
    price: "৳8,500",
    type: "Room",
    status: "Available",
    image: "https://images.unsplash.com/photo-1522708323590?w=400&h=250&fit=crop",
    posted: "2 days ago",
    interested: 12,
  },
  {
    id: 2,
    title: "Spacious 2-Bedroom in Dhanmondi",
    location: "Dhanmondi 27, Dhaka",
    price: "৳22,000",
    type: "Apartment",
    status: "Available",
    image: "https://images.unsplash.com/photo-1502672260266?w=400&h=250&fit=crop",
    posted: "5 days ago",
    interested: 8,
  },
  {
    id: 3,
    title: "Shared Room — Female Only",
    location: "Bashundhara R/A, Dhaka",
    price: "৳5,500",
    type: "Shared Room",
    status: "Booked",
    image: "https://images.unsplash.com/photo-1560185007?w=400&h=250&fit=crop",
    posted: "1 week ago",
    interested: 24,
  },
  {
    id: 4,
    title: "Furnished Flat near Gulshan Circle",
    location: "Gulshan 1, Dhaka",
    price: "৳35,000",
    type: "Flat",
    status: "Available",
    image: "https://images.unsplash.com/photo-1560448204?w=400&h=250&fit=crop",
    posted: "3 days ago",
    interested: 15,
  },
  {
    id: 5,
    title: "Affordable Room for Male Students",
    location: "Mirpur 10, Dhaka",
    price: "৳4,200",
    type: "Room",
    status: "Available",
    image: "https://images.unsplash.com/photo-1598928506311?w=400&h=250&fit=crop",
    posted: "1 day ago",
    interested: 31,
  },
  {
    id: 6,
    title: "Premium Studio Apartment",
    location: "Banani, Dhaka",
    price: "৳18,000",
    type: "Studio",
    status: "Pending",
    image: "https://images.unsplash.com/photo-1536376072261?w=400&h=250&fit=crop",
    posted: "4 days ago",
    interested: 6,
  },
];

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || "Student";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarLinks = [
    { icon: Search, label: "Browse Listings", active: true },
    { icon: Mail, label: "Messages", route: "/messages" },
    { icon: Bell, label: "Notifications" },
    { icon: User, label: "Profile", route: "/profile" },
    { icon: Settings, label: "Settings" },
  ];

  const stats = [
    { label: "Total Listings", value: "2,547", change: "+12%", up: true },
    { label: "Active Chats", value: role === "Owner" ? "34" : "8", change: "+5%", up: true },
    { label: "Saved Properties", value: "12", change: "", up: true },
    { label: "Monthly Visits", value: role === "Owner" ? "47" : "3", change: "+18%", up: true },
  ];

  const statusStyles = {
    Available: "border-[#2C1810] bg-[#FAF3E0] text-[#2C1810]",
    Booked: "border-[#5C3A21] bg-[#2C1810] text-[#FAF3E0]",
    Pending: "border-[#A89880] bg-[#FAF3E0] text-[#5C3A21]",
  };

  return (
    <div className="flex min-h-screen bg-[#FAF3E0] text-[#2C1810]">
      {/* ─── Mobile overlay ─── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-[#2C1810]/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r-2 border-[#5C3A21]/20 bg-[#FAF3E0] transition-transform lg:static lg:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Masthead */}
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
            {role}&apos;s Dashboard — Vol. IV
          </p>
        </div>

        {/* Nav links */}
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

        {/* User info */}
        <div className="border-t-2 border-[#5C3A21]/20 p-4">
          <div className="flex items-center gap-3 border-2 border-[#5C3A21]/20 bg-[#F4E8C1] p-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#2C1810] font-serif text-sm font-bold text-[#FAF3E0]">
              {role === "Student" ? "RS" : "SA"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-serif text-sm font-bold text-[#2C1810]">
                {role === "Student" ? "Rafsan Islam" : "Sharmin Akhter"}
              </p>
              <p className="truncate font-serif text-[10px] uppercase tracking-[0.15em] text-[#5C3A21]">{role}</p>
            </div>
            <button className="text-[#5C3A21] hover:text-[#2C1810] transition-colors">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b-2 border-[#5C3A21]/20 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <button
                className="p-2 text-[#5C3A21] hover:bg-[#F4E8C1] lg:hidden transition-colors"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <div>
                <h1 className="font-serif text-lg font-black text-[#2C1810]">
                  Welcome, {role === "Student" ? "Rafsan" : "Sharmin"}
                </h1>
                <p className="font-serif text-[10px] uppercase tracking-[0.15em] text-[#5C3A21]">
                  {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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
          {/* Edition bar */}
          <div className="border-t border-[#5C3A21]/10 px-6 py-1">
            <p className="font-serif text-[9px] uppercase tracking-[0.2em] text-[#A89880]">
              Edition: Daily &nbsp;|&nbsp; Dhaka, Bangladesh
            </p>
          </div>
        </header>

        {/* ─── Content ─── */}
        <div className="p-6 lg:p-8">
          {/* Stats row — ledger style */}
          <div className="mb-8 grid gap-px bg-[#5C3A21]/20 border-2 border-[#5C3A21]/20 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#FAF3E0] p-5">
                <p className="mb-1 font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                  {stat.label}
                </p>
                <div className="flex items-end justify-between">
                  <p className="font-serif text-3xl font-black text-[#2C1810]">{stat.value}</p>
                  {stat.change && (
                    <span className={`font-serif text-xs font-bold uppercase tracking-[0.1em] ${stat.up ? "text-[#2C1810]" : "text-[#A89880]"}`}>
                      {stat.change}
                    </span>
                  )}
                </div>
                {/* Thin rule */}
                <div className="mt-2 h-px bg-gradient-to-r from-[#2C1810] to-transparent opacity-20" />
              </div>
            ))}
          </div>

          {/* Listings header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-black tracking-tight text-[#2C1810]">
                {role === "Owner" ? "Your Listings" : "Recent Listings"}
              </h2>
              <p className="font-serif text-sm text-[#5C3A21]">
                {role === "Owner" ? "Manage your property listings" : "Browse available rooms and apartments near you"}
              </p>
            </div>
            <div className="flex gap-3">
              <select className="border-2 border-[#5C3A21]/30 bg-[#FAF3E0] px-4 py-2.5 font-serif text-xs font-bold uppercase tracking-[0.12em] text-[#5C3A21] outline-none transition-colors focus:border-[#2C1810]">
                <option>All Types</option>
                <option>Room</option>
                <option>Apartment</option>
                <option>Flat</option>
                <option>Studio</option>
              </select>
              {role === "Owner" && (
                <Link to="/listings/new" className="btn-rubber-stamp px-5 py-2 text-xs">
                  + Add Listing
                </Link>
              )}
            </div>
          </div>

          {/* Separator */}
          <hr className="news-rule mb-8" />

          {/* Listings grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dummyListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                state={{ listing }}
                className="group border-2 border-[#5C3A21]/20 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#2C1810]"
              >
                {/* Image */}
                <div className="halftone-overlay relative h-48 overflow-hidden border-b-2 border-[#5C3A21]/20">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-full w-full object-cover sepia-[40%] contrast-[1.05] transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Status stamp */}
                  <span className={`absolute left-3 top-3 border-2 px-2.5 py-1 font-serif text-[9px] font-bold uppercase tracking-[0.12em] ${statusStyles[listing.status]}`}>
                    {listing.status}
                  </span>
                  {/* Price stamp */}
                  <span className="absolute bottom-3 right-3 border-2 border-[#2C1810] bg-[#FAF3E0] px-2.5 py-1 font-serif text-sm font-bold text-[#2C1810]">
                    {listing.price}
                  </span>
                </div>

                {/* Info */}
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
            ))}
          </div>

          {/* Footer */}
          <div className="mt-10 border-t-2 border-[#5C3A21]/20 pt-6">
            <div className="flex items-center justify-between font-serif text-[10px] uppercase tracking-[0.15em] text-[#A89880]">
              <span>&copy; 2026 The Daily Gazette — All rights reserved.</span>
              <span>Est. 2022</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
