import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Newspaper,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifCount] = useState(3);
  const profileRef = useRef(null);

  const userName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("toletmama.api_user") || "{}");
      return user.name || "User";
    } catch {
      return "User";
    }
  })();

  const userInitial = userName.charAt(0).toUpperCase();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("toletmama.api_token");
    localStorage.removeItem("toletmama.api_user");
    setProfileOpen(false);
    navigate("/auth", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[#5C3A21]/20 bg-white/95 backdrop-blur-md shadow-[0_2px_8px_rgba(44,24,16,0.06)]">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#5C3A21]/20 text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810] lg:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-[#2C1810] bg-[#2C1810]">
            <Newspaper className="h-4 w-4 text-[#FAF3E0]" strokeWidth={2} />
          </div>
          <span className="hidden font-serif text-lg font-black tracking-tight text-[#2C1810] sm:block">
            ToLet<span className="text-[#5C3A21]">Mama</span>
          </span>
        </Link>

        {/* Desktop Search */}
        <div className="mx-auto hidden max-w-md flex-1 md:block">
          <div className="flex items-center gap-2 rounded-lg border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-1.5 transition-all duration-300 focus-within:border-[#2C1810] focus-within:shadow-[2px_2px_0px_rgba(44,24,16,0.1)]">
            <Search className="h-3.5 w-3.5 text-[#A89880]" strokeWidth={1.8} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search listings, messages..."
              className="w-full bg-transparent text-sm text-[#2C1810] outline-none placeholder:text-[#A89880]"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-[#A89880] hover:text-[#2C1810]">
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#5C3A21]/20 text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810] md:hidden"
          >
            <Search className="h-4 w-4" strokeWidth={1.8} />
          </button>

          {/* Notifications */}
          <Link
            to="/messages"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#5C3A21]/20 text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
          >
            <Bell className="h-4 w-4" strokeWidth={1.8} />
            {notifCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2C1810] text-[8px] font-black text-[#FAF3E0]">
                {notifCount}
              </span>
            )}
          </Link>

          {/* Theme toggle */}
          <div className="hidden sm:block">
            <ThemeToggle compact />
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg border-2 border-[#5C3A21]/20 px-2 py-1 transition-colors hover:border-[#2C1810]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#2C1810] bg-[#FAF3E0] text-[10px] font-black text-[#2C1810]">
                {userInitial}
              </div>
              <span className="hidden text-sm font-semibold text-[#2C1810] lg:block">{userName}</span>
              <ChevronDown className={`hidden h-3.5 w-3.5 text-[#A89880] transition-transform lg:block ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border-2 border-[#5C3A21]/20 bg-white shadow-[4px_4px_0px_rgba(44,24,16,0.1)]"
                >
                  <div className="border-b border-[#5C3A21]/10 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#A89880]">Signed in as</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-[#2C1810]">{userName}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#5C3A21] transition-colors hover:bg-[#FAF3E0] hover:text-[#2C1810]"
                    >
                      <User className="h-4 w-4" strokeWidth={1.8} />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#5C3A21] transition-colors hover:bg-[#FAF3E0] hover:text-[#2C1810]"
                    >
                      <Settings className="h-4 w-4" strokeWidth={1.8} />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-[#5C3A21]/10 py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#5C3A21] transition-colors hover:bg-[#FAF3E0] hover:text-[#2C1810]"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.8} />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile search bar (expanded) */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#5C3A21]/10 md:hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2">
              <Search className="h-4 w-4 shrink-0 text-[#A89880]" strokeWidth={1.8} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings, messages..."
                className="w-full bg-transparent text-sm text-[#2C1810] outline-none placeholder:text-[#A89880]"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-[#A89880] hover:text-[#2C1810]">
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
