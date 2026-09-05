import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, MapPin, Trash2, PenLine, Eye, PlusCircle, Sparkles, Users } from "lucide-react";
import { fetchMyListings, deleteListing, getCurrentUser } from "../lib/api";

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("Student");
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("toletmama.api_token")) {
      navigate("/auth", { replace: true });
      return;
    }
    getCurrentUser().then((u) => {
      const r = u.role === "owner" ? "Owner" : "Student";
      setUserRole(r);
      if (r !== "Owner") {
        navigate("/dashboard", { replace: true });
      }
    }).catch(() => {
      navigate("/auth", { replace: true });
    });
  }, [navigate]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMyListings();
      const raw = res.data || res || [];
      setListings(Array.isArray(raw) ? raw : []);
    } catch {
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      setToast("Listing deleted");
      setTimeout(() => setToast(""), 2000);
    } catch {
      setToast("Failed to delete");
      setTimeout(() => setToast(""), 2000);
    } finally {
      setDeletingId(null);
    }
  };

  if (userRole !== "Owner") {
    return null;
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-4 glass-pane rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">Owner Dashboard</p>
          <h1 className="font-serif text-3xl font-black tracking-tight text-[#2C1810]">My Listings</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#5C3A21]">Only your properties - edit, delete, or see who is interested. Students see all listings on Browse.</p>
        </div>
        <Link to="/listings/new" className="btn-rubber-stamp inline-flex items-center gap-2 px-6 py-3 text-sm">
          <PlusCircle className="h-4 w-4" /> Add Listing
        </Link>
      </motion.div>

      <div className="mb-4 flex items-center justify-between rounded-sm border border-[#5C3A21]/10 bg-[#FAF3E0]/60 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5C3A21]">{listings.length} listing{listings.length !== 1 ? "s" : ""} found</p>
        <Link to="/dashboard" className="text-xs font-bold uppercase tracking-[0.15em] text-[#A89880] hover:text-[#2C1810]">← Browse all</Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse glass-pane rounded-2xl p-5">
              <div className="h-40 rounded-xl bg-[#5C3A21]/10" />
              <div className="mt-4 h-4 w-3/4 rounded bg-[#5C3A21]/10" />
              <div className="mt-2 h-3 w-1/2 rounded bg-[#5C3A21]/10" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-pane rounded-3xl p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "var(--theme-surface-2)" }}>
            <Building2 className="h-8 w-8 text-[#A89880]" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-black text-[#2C1810]">No listings yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#5C3A21]">You haven't posted any property. Create your first listing to get inquiries from students.</p>
          <Link to="/listings/new" className="btn-rubber-stamp mt-6 inline-flex px-6 py-3 text-sm">Create Listing</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((l) => {
            const img = Array.isArray(l.images) && l.images.length ? l.images[0] : l.image || "https://images.unsplash.com/photo-1522708323590?w=600&h=400&fit=crop";
            return (
              <div key={l.id} className="glass-pane group flex flex-col overflow-hidden rounded-2xl">
                <div className="relative h-48 overflow-hidden border-b-2 border-[#5C3A21]/15">
                  <img src={img} alt={l.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className={`absolute left-3 top-3 border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${l.status === 'booked' ? 'border-[#5C3A21] bg-[#2C1810] text-[#FAF3E0]' : l.status === 'pending' ? 'border-[#A89880] bg-[#FAF3E0] text-[#5C3A21]' : 'border-[#2C1810] bg-[#FAF3E0] text-[#2C1810]'}`}>
                    {l.status || 'available'}
                  </span>
                  <span className="absolute bottom-3 right-3 border-2 border-[#2C1810] bg-[#FAF3E0] px-3 py-1 text-sm font-black text-[#2C1810]">{l.price}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-base font-black leading-snug text-[#2C1810]">{l.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#5C3A21]"><MapPin className="h-3.5 w-3.5" />{l.location}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-[#5C3A21]">{l.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#A89880]"><Users className="h-3.5 w-3.5" />{l.type} • {l.created_at ? new Date(l.created_at).toLocaleDateString() : 'Recently'}</div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Link to={`/listings/${l.id}`} className="btn-coupon-clip justify-center px-2 py-2 text-xs"><Eye className="h-3.5 w-3.5" />View</Link>
                    <Link to={`/listings/${l.id}/edit`} state={{ listing: l }} className="btn-coupon-clip justify-center px-2 py-2 text-xs"><PenLine className="h-3.5 w-3.5" />Edit</Link>
                    <button type="button" onClick={() => handleDelete(l.id)} disabled={deletingId === l.id} className="btn-coupon-clip justify-center border-[#8B1A1A] px-2 py-2 text-xs text-[#8B1A1A] disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" />{deletingId === l.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-2xl border-2 border-[#2C1810] bg-[#2C1810] px-4 py-3 text-sm font-bold text-[#FAF3E0] shadow-lg">{toast}</div>
      )}
    </div>
  );
}
