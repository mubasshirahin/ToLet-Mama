import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRoommateProfile, fetchRoommates, saveRoommateProfile } from "../lib/api";
import { useLanguage } from "../theme/LanguageProvider";

const field = "w-full rounded-xl border bg-transparent px-3 py-2 text-sm";
const style = { borderColor: "var(--theme-border)", color: "var(--theme-ink)" };

export default function RoommatesPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState({ preferred_location: "", max_rent: "", move_in_date: "", gender_preference: "any", bio: "" });
  const [filters, setFilters] = useState({ location: "", max_rent: "" });
  const [people, setPeople] = useState([]);
  const [message, setMessage] = useState("");
  const load = async () => {
    try {
      const [mine, matches] = await Promise.all([fetchRoommateProfile(), fetchRoommates(filters)]);
      if (mine) setProfile((old) => ({ ...old, ...mine, max_rent: String(mine.max_rent || "") }));
      setPeople(matches.data || []);
    } catch { setMessage("Sign in to create a roommate profile and browse matches."); }
  };
  useEffect(() => { load(); }, []);
  const save = async (event) => {
    event.preventDefault(); setMessage("");
    try { await saveRoommateProfile({ ...profile, max_rent: Number(profile.max_rent), is_active: true }); setMessage("Your profile is saved."); await load(); }
    catch (error) { setMessage(error.response?.data?.message || "Could not save your profile."); }
  };
  return <main className="mx-auto max-w-6xl space-y-6 p-5 md:p-8" style={{ color: "var(--theme-ink)" }}>
    <header><p className="text-xs font-bold uppercase tracking-widest opacity-60">To-Let Mama</p><h1 className="mt-2 font-serif text-3xl font-black">{t("Find a roommate")}</h1><p className="mt-2 opacity-70">{t("Share your budget and area to find people looking for a compatible home.")}</p></header>
    {message && <p role="status" className="rounded-xl border p-3 text-sm" style={style}>{message}</p>}
    <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={save} className="glass-pane space-y-3 rounded-2xl border p-5" style={style}>
        <h2 className="font-serif text-xl font-bold">{t("My roommate profile")}</h2>
        <label className="block text-sm">{t("Preferred area")}<input required className={field} style={style} value={profile.preferred_location} onChange={(e) => setProfile({ ...profile, preferred_location: e.target.value })} /></label>
        <label className="block text-sm">{t("Maximum monthly rent (BDT)")}<input required type="number" min="1" className={field} style={style} value={profile.max_rent} onChange={(e) => setProfile({ ...profile, max_rent: e.target.value })} /></label>
        <label className="block text-sm">{t("Move-in date")}<input type="date" className={field} style={style} value={profile.move_in_date || ""} onChange={(e) => setProfile({ ...profile, move_in_date: e.target.value })} /></label>
        <label className="block text-sm">{t("Roommate preference")}<select className={field} style={style} value={profile.gender_preference || "any"} onChange={(e) => setProfile({ ...profile, gender_preference: e.target.value })}><option value="any">{t("Any")}</option><option value="male">{t("Male")}</option><option value="female">{t("Female")}</option></select></label>
        <label className="block text-sm">{t("About me")}<textarea className={field} style={style} value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></label>
        <button className="rounded-xl px-4 py-2 font-bold" style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}>{t("Save profile")}</button>
      </form>
      <section className="space-y-3"><h2 className="font-serif text-xl font-bold">{t("People looking for a roommate")}</h2>
        <form className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); load(); }}><input aria-label="Filter by area" className={field} style={style} placeholder="Area" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} /><input aria-label="Maximum rent" type="number" className={field} style={style} placeholder="Maximum rent" value={filters.max_rent} onChange={(e) => setFilters({ ...filters, max_rent: e.target.value })} /><button className="rounded-xl border px-4 py-2 text-sm" style={style}>Find matches</button></form>
        {people.map((person) => <article key={person.id} className="glass-pane rounded-2xl border p-4" style={style}><div className="flex justify-between gap-3"><strong>{person.user?.name}</strong><span>৳{Number(person.max_rent).toLocaleString()}/mo</span></div><p className="mt-1 text-sm opacity-70">{person.preferred_location} · Move in {person.move_in_date || "flexible"}</p><p className="mt-2 text-sm">{person.bio || "No introduction added."}</p><Link className="mt-3 inline-block text-sm font-bold underline" to="/messages" state={{ userId: person.user?.id }}>Message {person.user?.name}</Link></article>)}
        {!people.length && <p className="opacity-60">{t("No matching profiles found yet.")}</p>}
      </section>
    </div>
  </main>;
}
