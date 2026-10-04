import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, MapPin, Trash2, PenLine, Eye, PlusCircle, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchMyListings, fetchMyListingAnalytics, deleteListing, getCurrentUser } from "../lib/api";
import { Button, ListingCardSkeleton, Modal } from "./ui";

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("Student");
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [analytics, setAnalytics] = useState({});

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

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, metrics] = await Promise.all([fetchMyListings({ search, status, page }), fetchMyListingAnalytics()]);
      setListings(res.data || []);
      setLastPage(res.last_page || 1);
      setTotal(res.total || 0);
      setAnalytics(metrics || {});
    } catch {
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!listingToDelete) return;
    const id = listingToDelete.id;
    setDeletingId(id);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      setListingToDelete(null);
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
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5C3A21]">{total} listing{total !== 1 ? "s" : ""} found</p>
        <Link to="/dashboard" className="text-xs font-bold uppercase tracking-[0.15em] text-[#A89880] hover:text-[#2C1810]">← Browse all</Link>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl glass-pane p-4 sm:grid-cols-[1fr_200px]">
        <label className="flex items-center gap-2 border border-[#5C3A21]/20 px-3">
          <Search className="h-4 w-4 text-[#A89880]" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search your listings by title or area" className="w-full bg-transparent py-3 text-sm outline-none" />
        </label>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="border border-[#5C3A21]/20 bg-transparent px-3 py-3 text-sm">
          <option value="">All statuses</option><option value="available">Available</option><option value="booked">Booked</option><option value="pending">Pending</option>
        </select>
      </div>

      {isLoading ? (
        <div role="status" aria-label="Loading your listings" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ListingCardSkeleton key={index} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-pane rounded-3xl p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "var(--theme-surface-2)" }}>
            <Building2 className="h-8 w-8 text-[#A89880]" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-black text-[#2C1810]">{search || status ? "No listings match these filters" : "No listings yet"}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#5C3A21]">{search || status ? "Try a different search or clear the status filter." : "You haven't posted any property. Create your first listing to get inquiries from students."}</p>
          {search || status ? <button onClick={() => { setSearch(""); setStatus(""); setPage(1); }} className="btn-coupon-clip mt-6 px-6 py-3 text-sm">Clear filters</button> : <Link to="/listings/new" className="btn-rubber-stamp mt-6 inline-flex px-6 py-3 text-sm">Create Listing</Link>}
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
                  <div className="mt-3 grid grid-cols-2 gap-2 border-y border-[#5C3A21]/10 py-3 text-xs text-[#5C3A21] sm:grid-cols-4">
                    <span>{analytics[l.id]?.views_total || 0} views</span><span>{analytics[l.id]?.views_this_month || 0} this month</span><span>{analytics[l.id]?.saved_count || 0} saves</span><span>{analytics[l.id]?.inquiries_count || 0} inquiries</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Link to={`/listings/${l.id}`} className="btn-coupon-clip justify-center px-2 py-2 text-xs"><Eye className="h-3.5 w-3.5" />View</Link>
                    <Link to={`/listings/${l.id}/edit`} state={{ listing: l }} className="btn-coupon-clip justify-center px-2 py-2 text-xs"><PenLine className="h-3.5 w-3.5" />Edit</Link>
                    <button type="button" onClick={() => setListingToDelete(l)} disabled={deletingId === l.id} className="btn-coupon-clip justify-center border-[#8B1A1A] px-2 py-2 text-xs text-[#8B1A1A] disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" />{deletingId === l.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && lastPage > 1 && <nav aria-label="My listings pages" className="mt-6 flex items-center justify-center gap-4">
        <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="btn-coupon-clip px-4 py-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
        <span className="text-sm">Page {page} of {lastPage}</span>
        <button disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)} className="btn-coupon-clip px-4 py-2 disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button>
      </nav>}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-2xl border-2 border-[#2C1810] bg-[#2C1810] px-4 py-3 text-sm font-bold text-[#FAF3E0] shadow-lg">{toast}</div>
      )}

      <Modal
        open={Boolean(listingToDelete)}
        onClose={() => deletingId === null && setListingToDelete(null)}
        title="Delete listing?"
        description="This action cannot be undone."
        footer={(
          <>
            <Button variant="secondary" onClick={() => setListingToDelete(null)} disabled={deletingId !== null}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deletingId !== null}>
              Delete listing
            </Button>
          </>
        )}
      >
        <p className="text-sm text-[var(--theme-ink-muted)]">Delete “{listingToDelete?.title}” from your listings?</p>
      </Modal>
    </div>
  );
}
