import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Newspaper,
  PlusCircle,
  Settings,
  Star,
  User,
  FileText,
} from "lucide-react";

const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      { label: "Browse Listings", icon: LayoutDashboard, to: "/dashboard" },
      { label: "Messages", icon: Mail, to: "/messages", badge: 3 },
      { label: "Notifications", icon: Bell, to: "/notifications", badge: 5 },
    ],
  },
  {
    section: "Manage",
    items: [
      { label: "My Listings", icon: Building2, to: "/dashboard", role: "Owner" },
      { label: "Add Listing", icon: PlusCircle, to: "/listings/new", role: "Owner" },
      { label: "Saved", icon: Star, to: "/dashboard" },
    ],
  },
  {
    section: "Others",
    items: [
      { label: "Profile", icon: User, to: "/profile" },
      { label: "Help Center", icon: LifeBuoy, to: "#" },
      { label: "Guidelines", icon: FileText, to: "#" },
      { label: "About", icon: HelpCircle, to: "#" },
    ],
  },
];

export default function Sidebar({ open, onClose, role = "Student" }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("toletmama.sidebar.collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("toletmama.sidebar.collapsed", String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const isActive = (path) => {
    if (path === "#") return false;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          glass-pane fixed inset-y-0 left-0 z-40 flex flex-col
          transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:h-screen lg:shadow-none
          ${collapsed ? "w-[68px]" : "w-64"}
          ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 px-5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
          >
            <Newspaper className="h-4 w-4" strokeWidth={2} />
          </div>
          {!collapsed && (
            <span className="font-serif text-lg font-black tracking-tight" style={{ color: "var(--theme-ink)" }}>
              To-Let <span style={{ color: "var(--theme-ink-muted)" }}>Mama</span>
            </span>
          )}
        </div>
        <div className="mx-4 h-px" style={{ background: "var(--theme-border)" }} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          {NAV_ITEMS.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.role || item.role === role
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.section} className="mb-5">
                {!collapsed && (
                  <p className="mb-2 px-3 font-serif text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--theme-ink-faded)" }}>
                    {group.section}
                  </p>
                )}
                {collapsed && <div className="mb-2 mx-3 h-px" style={{ background: "var(--theme-border)" }} />}
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.to);

                    return (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          onClick={onClose}
                          title={collapsed ? item.label : undefined}
                          className={`
                            group relative flex items-center rounded-2xl transition-all duration-200
                            ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                            ${
                              active
                                ? "text-[var(--theme-bg)]"
                                : "transition-colors hover:bg-[var(--theme-surface)]"
                            }
                          `}
                          style={
                            active
                              ? { background: "var(--theme-ink)", color: "var(--theme-bg)" }
                              : { color: "var(--theme-ink-muted)" }
                          }
                        >
                          <Icon
                            className="h-4 w-4 shrink-0"
                            strokeWidth={active ? 2.2 : 1.8}
                            style={active ? { color: "var(--theme-bg)" } : {}}
                          />
                          {!collapsed && (
                            <span className="flex-1 font-serif text-sm font-medium">{item.label}</span>
                          )}
                          {!collapsed && item.badge && (
                            <span
                              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black"
                              style={
                                active
                                  ? { background: "var(--theme-bg)", color: "var(--theme-ink)" }
                                  : { background: "var(--theme-ink)", color: "var(--theme-bg)" }
                              }
                            >
                              {item.badge}
                            </span>
                          )}
                          {collapsed && item.badge && (
                            <span
                              className="absolute right-1 top-1 h-2 w-2 rounded-full"
                              style={{ background: "var(--theme-ink)" }}
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="hidden border-t px-3 py-2 lg:block" style={{ borderColor: "var(--theme-border)" }}>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 font-serif text-xs font-semibold transition-colors hover:bg-[var(--theme-surface)] ${collapsed ? "justify-center px-0" : ""}`}
            style={{ borderColor: "var(--theme-border)", color: "var(--theme-ink-muted)" }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Footer / User card */}
        <div className="border-t p-3" style={{ borderColor: "var(--theme-border)" }}>
          <div className={`flex items-center rounded-2xl glass-pane ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-black"
              style={{ borderColor: "var(--theme-ink)", color: "var(--theme-ink)", background: "var(--theme-surface)" }}
            >
              {(() => {
                try {
                  const user = JSON.parse(localStorage.getItem("toletmama.api_user") || "{}");
                  return (user.name || "U").charAt(0).toUpperCase();
                } catch {
                  return "U";
                }
              })()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-xs font-bold" style={{ color: "var(--theme-ink)" }}>
                  {(() => {
                    try {
                      const user = JSON.parse(localStorage.getItem("toletmama.api_user") || "{}");
                      return user.name || "User";
                    } catch {
                      return "User";
                    }
                  })()}
                </p>
                <p className="font-serif text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--theme-ink-faded)" }}>
                  {role}
                </p>
              </div>
            )}
            {!collapsed && (
              <Link
                to="/profile"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-[var(--theme-surface)]"
                style={{ borderColor: "var(--theme-border)", color: "var(--theme-ink-muted)" }}
                title="Profile"
              >
                <Settings className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
