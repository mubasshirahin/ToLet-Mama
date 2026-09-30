import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNotifications, readNotification } from "../lib/api";
import { useLanguage } from "../theme/LanguageProvider";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const load = () => fetchNotifications().then(setItems).catch(() => setError("Sign in to see your notifications."));
  useEffect(() => { load(); }, []);
  const markRead = async (id) => { await readNotification(id); setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item)); };
  return <div className="mx-auto max-w-4xl space-y-5 p-5 md:p-8" style={{ color: "var(--theme-ink)" }}><header><p className="text-xs font-bold uppercase tracking-[.2em] opacity-60">Updates</p><h1 className="mt-2 font-serif text-3xl font-black">{t("Notifications")}</h1><p className="mt-2 text-sm opacity-70">{t("Messages, viewing requests, and saved-search matches.")}</p></header>{error && <p role="alert">{error}</p>}{items.map((item) => <article key={item.id} className={`glass-pane rounded-2xl border p-4 ${item.read_at ? "opacity-65" : ""}`} style={{ borderColor: "var(--theme-border)" }}><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">{item.data?.title || "Update"}</h2><p className="mt-1 text-sm opacity-75">{item.data?.body}</p><p className="mt-2 text-xs opacity-50">{new Date(item.created_at).toLocaleString()}</p>{item.data?.url && <Link className="mt-2 inline-block text-sm font-bold underline" to={item.data.url}>Open</Link>}</div>{!item.read_at && <button onClick={() => markRead(item.id)} className="shrink-0 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "var(--theme-border)" }}>{t("Mark read")}</button>}</div></article>)}{!error && !items.length && <p className="rounded-xl border p-5 text-sm opacity-65" style={{ borderColor: "var(--theme-border)" }}>{t("You are all caught up.")}</p>}</div>;
}
