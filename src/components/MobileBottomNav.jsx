import { Link, useLocation } from "react-router-dom";
import { Heart, LayoutDashboard, Mail, Menu, User, X } from "lucide-react";

const ITEMS = [
    { label: "Browse", to: "/dashboard", icon: LayoutDashboard },
    { label: "Messages", to: "/messages", icon: Mail },
    { label: "Saved", to: "/saved", icon: Heart },
    { label: "Profile", to: "/profile", icon: User },
];

export default function MobileBottomNav({ menuOpen, onOpenMenu }) {
    const location = useLocation();

    return (
        <nav
            aria-label="Mobile navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t pt-1 lg:hidden"
            style={{
                background: "var(--theme-elevated)",
                borderColor: "var(--theme-border)",
                paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))",
            }}
        >
            <div className="mx-auto grid max-w-lg grid-cols-5 px-1">
                {ITEMS.map(({ label, to, icon: Icon }) => {
                    const active = location.pathname === to || location.pathname.startsWith(`${to}/`);

                    return (
                        <Link
                            key={to}
                            to={to}
                            aria-current={active ? "page" : undefined}
                            className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1"
                            style={{ color: active ? "var(--theme-ink)" : "var(--theme-ink-muted)" }}
                        >
                            <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                            <span className="max-w-full truncate text-[10px] font-semibold leading-none">{label}</span>
                        </Link>
                    );
                })}
                <button
                    type="button"
                    onClick={onOpenMenu}
                    aria-label={menuOpen ? "Navigation menu open" : "Open navigation menu"}
                    aria-controls="app-navigation-drawer"
                    aria-expanded={menuOpen}
                    className="flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1"
                    style={{ color: menuOpen ? "var(--theme-ink)" : "var(--theme-ink-muted)" }}
                >
                    {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    <span className="max-w-full truncate text-[10px] font-semibold leading-none">More</span>
                </button>
            </div>
        </nav>
    );
}