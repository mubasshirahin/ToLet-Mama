import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-16">
      <section className="glass-pane w-full max-w-lg rounded-xl border p-6 sm:p-10" style={{ borderColor: "var(--theme-border)" }}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.24em]" style={{ color: "var(--theme-ink-faded)" }}>404 · Page not found</p>
        <h1 className="mt-4 break-words font-serif text-3xl font-black sm:text-4xl" style={{ color: "var(--theme-ink)" }}>This place isn’t on the map.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6" style={{ color: "var(--theme-ink-muted)" }}>The link may be outdated or the page may have moved. Head back to To-Let Mama and keep looking.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-rubber-stamp inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm sm:w-auto"><Home className="h-4 w-4" />Home</Link>
          <Link to="/dashboard" className="btn-coupon-clip inline-flex w-full items-center justify-center px-5 py-3 text-sm sm:w-auto"><Search className="h-4 w-4" />Browse listings</Link>
        </div>
      </section>
    </main>
  );
}
