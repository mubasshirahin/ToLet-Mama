import { useState } from "react";
import { useLocation } from "react-router-dom";

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

const sidebarLinks = [
  { icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z", label: "Dashboard", active: true },
  { icon: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z", label: "Browse Listings" },
  { icon: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75", label: "Messages" },
  { icon: "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0", label: "Notifications" },
  { icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z", label: "Profile" },
  { icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z", label: "Settings" },
];

function DashboardPage() {
  const location = useLocation();
  const role = location.state?.role || "Student";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const stats = [
    { label: "Total Listings", value: "2,547", change: "+12%", up: true, color: "indigo" },
    { label: "Active Chats", value: role === "Owner" ? "34" : "8", change: "+5%", up: true, color: "emerald" },
    { label: "Saved", value: "12", change: "", up: true, color: "amber" },
    { label: "Visits This Month", value: role === "Owner" ? "47" : "3", change: "+18%", up: true, color: "rose" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ─── Mobile overlay ─── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">ToLet Mama</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarLinks.map((link) => (
            <button
              key={link.label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                link.active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {link.label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {role === "Student" ? "RS" : "SA"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {role === "Student" ? "Rafsan Islam" : "Sharmin Akhter"}
              </p>
              <p className="truncate text-xs text-slate-500">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-xl">
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">
              Welcome back, {role === "Student" ? "Rafsan" : "Sharmin"} 👋
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">3</span>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {role === "Student" ? "RS" : "SA"}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <p className="mb-1 text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  {stat.change && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stat.up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {stat.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Listings header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {role === "Owner" ? "Your Listings" : "Recent Listings"}
              </h2>
              <p className="text-sm text-slate-500">
                {role === "Owner" ? "Manage your property listings" : "Browse available rooms and apartments near you"}
              </p>
            </div>
            <div className="flex gap-3">
              <select className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                <option>All Types</option>
                <option>Room</option>
                <option>Apartment</option>
                <option>Flat</option>
                <option>Studio</option>
              </select>
              {role === "Owner" && (
                <button className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95">
                  + Add Listing
                </button>
              )}
            </div>
          </div>

          {/* Listings grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dummyListings.map((listing) => (
              <div
                key={listing.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span
                    className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      listing.status === "Available"
                        ? "bg-emerald-500 text-white"
                        : listing.status === "Booked"
                          ? "bg-rose-500 text-white"
                          : "bg-amber-500 text-white"
                    }`}
                  >
                    {listing.status}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2.5 py-1 text-sm font-bold text-slate-900 backdrop-blur-sm">
                    {listing.price}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="mb-1 text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                    {listing.title}
                  </h3>
                  <div className="mb-3 flex items-center gap-1 text-xs text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {listing.location}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {listing.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                      </svg>
                      {listing.interested} interested
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
