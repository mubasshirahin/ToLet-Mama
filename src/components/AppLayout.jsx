import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [role, setRole] = useState("Student");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("toletmama.api_user") || "{}");
      if (user.role) setRole(user.role === "owner" ? "Owner" : "Student");
      else if (location.state?.role) setRole(location.state.role === "owner" || location.state.role === "Owner" ? "Owner" : "Student");
    } catch {
      // keep default
    }
  }, [location.state, location.pathname]);

  // Also listen to storage changes and auth updates
  useEffect(() => {
    const onStorage = () => {
      try {
        const u = JSON.parse(localStorage.getItem("toletmama.api_user") || "{}");
        if (u.role) setRole(u.role === "owner" ? "Owner" : "Student");
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    // Poll for role changes after login
    const interval = setInterval(onStorage, 1000);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(interval); };
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--theme-bg)]">
      {/* Sidebar — always present */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
      />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Navbar — always present */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
