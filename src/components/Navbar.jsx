import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Dropdown } from "./ui";

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifCount] = useState(3);

  const userName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("toletmama.api_user") || "{}");
      return user.name || "User";
    } catch {
      return "User";
    }
  })();

  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("toletmama.api_token");
    localStorage.removeItem("toletmama.api_user");
    navigate("/auth", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-pane-strong mx-auto mt-2 flex h-14 max-w-screen-xl items-center gap-3 rounded-full px-4 lg:px-6">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[var(--theme-ink)] hover:text-[var(--theme-bg)] lg:hidden"
          style={{ borderColor: "var(--theme-border-strong)", color: "var(--theme-ink-muted)" }}
          aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="app-navigation-drawer"
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Desktop Search */}
        <div className="mx-auto hidden max-w-md flex-1 md:block">
          <div className="glass-pane flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 focus-within:border-[var(--theme-border-strong)]">
            <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--theme-ink-muted)" }} strokeWidth={2} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search listings, messages..."
              className="w-full bg-transparent font-serif text-sm outline-none placeholder:opacity-60"
              style={{ color: "var(--theme-ink)" }}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} style={{ color: "var(--theme-ink-muted)" }}>
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
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[var(--theme-ink)] hover:text-[var(--theme-bg)] md:hidden"
            style={{ borderColor: "var(--theme-border-strong)", color: "var(--theme-ink-muted)" }}
          >
            <Search className="h-4 w-4" strokeWidth={2} />
          </button>

          {/* Notifications */}
          <Link
            to="/messages"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[var(--theme-ink)] hover:text-[var(--theme-bg)]"
            style={{ borderColor: "var(--theme-border-strong)", color: "var(--theme-ink-muted)" }}
          >
            <Bell className="h-4 w-4" strokeWidth={2} />
            {notifCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black"
                style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
              >
                {notifCount}
              </span>
            )}
          </Link>

          {/* Theme toggle */}
          <ThemeToggle compact />

          {/* Profile dropdown */}
          <Dropdown
            trigger={({ isOpen, setIsOpen }) => (
              <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border px-2 py-1 transition-colors"
                style={{ borderColor: "var(--theme-border-strong)" }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black"
                  style={{ borderColor: "var(--theme-ink)", color: "var(--theme-ink)", background: "var(--theme-surface)" }}
                >
                  {userInitial}
                </div>
                <span className="hidden font-serif text-sm font-semibold lg:block" style={{ color: "var(--theme-ink)" }}>
                  {userName}
                </span>
                <ChevronDown
                  className={`hidden h-3.5 w-3.5 transition-transform lg:block ${isOpen ? "rotate-180" : ""}`}
                  style={{ color: "var(--theme-ink-muted)" }}
                />
              </button>
            )}
          >
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--theme-border)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-muted)" }}>
                Signed in as
              </p>
              <p className="mt-0.5 truncate font-serif text-sm font-bold" style={{ color: "var(--theme-ink)" }}>
                {userName}
              </p>
            </div>
            <div className="py-1">
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-serif text-sm transition-colors hover:bg-[var(--theme-surface)]"
                style={{ color: "var(--theme-ink-muted)" }}
              >
                <User className="h-4 w-4" strokeWidth={2} />
                Profile
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-serif text-sm transition-colors hover:bg-[var(--theme-surface)]"
                style={{ color: "var(--theme-ink-muted)" }}
              >
                <Settings className="h-4 w-4" strokeWidth={2} />
                Settings
              </Link>
            </div>
            <div className="border-t py-1" style={{ borderColor: "var(--theme-border)" }}>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 font-serif text-sm transition-colors hover:bg-[var(--theme-surface)]"
                style={{ color: "var(--theme-ink-muted)" }}
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Sign out
              </button>
            </div>
          </Dropdown>
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
            className="overflow-hidden px-4 pt-2 md:hidden"
          >
            <div className="glass-pane flex items-center gap-2 rounded-full px-4 py-2">
              <Search className="h-4 w-4 shrink-0" style={{ color: "var(--theme-ink-muted)" }} strokeWidth={2} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings, messages..."
                className="w-full bg-transparent font-serif text-sm outline-none placeholder:opacity-60"
                style={{ color: "var(--theme-ink)" }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} style={{ color: "var(--theme-ink-muted)" }}>
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
