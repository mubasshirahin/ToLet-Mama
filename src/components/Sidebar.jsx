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
            className="fixed inset-0 z-40 bg-[#2C1810]/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col bg-white
          transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:h-screen lg:shadow-none
          ${collapsed ? "w-[68px]" : "w-64"}
          ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 px-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[#2C1810] bg-[#2C1810]">
            <Newspaper className="h-4 w-4 text-[#FAF3E0]" strokeWidth={2} />
          </div>
          {!collapsed && (
            <span className="font-serif text-lg font-black tracking-tight text-[#2C1810]">
              ToLet<span className="text-[#5C3A21]">Mama</span>
            </span>
          )}
        </div>
        <div className="mx-4 h-px bg-[#5C3A21]/20" />

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
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89880]">
                    {group.section}
                  </p>
                )}
                {collapsed && <div className="mb-2 h-px mx-3 bg-[#5C3A21]/10" />}
                <ul className="space-y-0.5">
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
                            group relative flex items-center rounded-lg transition-all duration-200
                            ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                            ${
                              active
                                ? "border-2 border-[#2C1810] bg-[#2C1810] text-[#FAF3E0] shadow-[2px_2px_0px_rgba(44,24,16,0.1)]"
                                : "border-2 border-transparent text-[#5C3A21] hover:border-[#5C3A21]/20 hover:bg-[#FAF3E0]"
                            }
                          `}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0 ${active ? "text-[#FAF3E0]" : "text-[#A89880] group-hover:text-[#2C1810]"}`}
                            strokeWidth={active ? 2.2 : 1.8}
                          />
                          {!collapsed && (
                            <span className="flex-1 text-sm font-medium">{item.label}</span>
                          )}
                          {!collapsed && item.badge && (
                            <span
                              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                                active
                                  ? "bg-[#FAF3E0] text-[#2C1810]"
                                  : "bg-[#2C1810] text-[#FAF3E0]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {collapsed && item.badge && (
                            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#2C1810]" />
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
        <div className="hidden border-t-2 border-[#5C3A21]/20 px-3 py-2 lg:block">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className={`flex w-full items-center gap-2 rounded-lg border-2 border-[#5C3A21]/10 px-3 py-2 text-xs font-semibold text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810] ${collapsed ? "justify-center px-0" : ""}`}
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
        <div className="border-t-2 border-[#5C3A21]/20 p-3">
          <div className={`flex items-center rounded-lg border-2 border-[#5C3A21]/10 bg-[#FAF3E0] ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#2C1810] bg-white text-[11px] font-black text-[#2C1810]">
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
                <p className="truncate text-xs font-bold text-[#2C1810]">
                  {(() => {
                    try {
                      const user = JSON.parse(localStorage.getItem("toletmama.api_user") || "{}");
                      return user.name || "User";
                    } catch {
                      return "User";
                    }
                  })()}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A89880]">{role}</p>
              </div>
            )}
            {!collapsed && (
              <Link
                to="/profile"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#5C3A21]/20 text-[#A89880] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
                title="Profile"
              >
                <Settings className="h-3.5 w-3.5" strokeWidth={1.8} />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
