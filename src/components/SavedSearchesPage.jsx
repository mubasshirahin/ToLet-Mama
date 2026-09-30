import { useEffect, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { deleteSearch, fetchSavedSearches, saveSearch } from "../lib/api";

const inputClass = "w-full rounded-xl border bg-transparent px-3 py-2 text-sm";
const style = { borderColor: "var(--theme-border)", color: "var(--theme-ink)" };

export default function SavedSearchesPage() {
  const [items, setItems] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const refresh = async () => { try { setItems(await fetchSavedSearches()); setError(""); } catch { setError("Sign in to manage saved searches."); } };
  useEffect(() => { refresh(); }, []);
  const submit = async (event) => {
    event.preventDefault(); setNotice(""); setError("");
    const form = new FormData(event.currentTarget); const location = String(form.get("location") || "").trim(); const maxPrice = form.get("max_price");
    try {
      await saveSearch({ name: location ? `${location} rentals` : "My rental search", filters: { search: location, max_price: maxPrice || "" }, alerts_enabled: true });
      event.currentTarget.reset(); setNotice("Search saved. Alerts are enabled for matching new listings."); await refresh();
    } catch (e) { setError(e.response?.data?.message || "Could not save the search."); }
  };
  const remove = async (id) => { try { await deleteSearch(id); await refresh(); setNotice("Saved search removed."); } catch { setError("Could not remove this search."); } };
  return <main className="mx-auto max-w-5xl space-y-6 p-5 md:p-8" style={{ color: "var(--theme-ink)" }}>
    <header><p className="text-xs font-bold uppercase tracking-widest opacity-60">To-Let Mama</p><h1 className="mt-2 font-serif text-3xl font-black">Saved searches and alerts</h1><p className="mt-2 opacity-70">Save an area and rent limit, then return to the same search when you browse.</p></header>
    {error && <p role="alert" className="rounded-xl border border-red-400/50 p-3 text-sm">{error}</p>}{notice && <p role="status" className="rounded-xl border border-emerald-500/50 p-3 text-sm">{notice}</p>}
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={submit} className="glass-pane space-y-4 rounded-2xl border p-5" style={style}><h2 className="flex items-center gap-2 font-serif text-xl font-bold"><Bell size={20}/> Create a search alert</h2><label className="block text-sm">Area or search phrase<input name="location" className={inputClass} style={style} placeholder="e.g. Mirpur" /></label><label className="block text-sm">Maximum monthly rent (BDT)<input name="max_price" type="number" min="0" className={inputClass} style={style} placeholder="Optional" /></label><button className="rounded-xl px-4 py-2 font-bold" style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}>Save search and enable alerts</button></form>
      <section className="space-y-3"><h2 className="font-serif text-xl font-bold">My saved searches</h2>{items.map((item) => <article key={item.id} className="glass-pane flex items-center justify-between gap-3 rounded-xl border p-4" style={style}><div><strong>{item.name}</strong><p className="text-xs opacity-60">Alerts {item.alerts_enabled ? "on" : "off"}</p><p className="text-xs opacity-60">{item.filters?.search || "All areas"}{item.filters?.max_price ? ` · up to ৳${Number(item.filters.max_price).toLocaleString()}` : ""}</p></div><button type="button" title="Delete saved search" aria-label={`Delete ${item.name}`} onClick={() => remove(item.id)}><Trash2 size={18}/></button></article>)}{!items.length && <p className="opacity-60">No saved searches yet.</p>}</section>
    </div>
  </main>;
}
