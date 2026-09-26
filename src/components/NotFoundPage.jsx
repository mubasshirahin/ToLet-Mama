import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16 text-center">
      <section className="glass-pane w-full max-w-xl rounded-3xl p-8 sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#A89880]">404 · Page not found</p>
        <h1 className="mt-4 font-serif text-4xl font-black text-[#2C1810]">This place isn’t on the map.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#5C3A21]">The link may be outdated or the page may have moved. Head back to To-Let Mama and keep looking.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-rubber-stamp inline-flex items-center justify-center gap-2 px-5 py-3 text-sm"><Home className="h-4 w-4" />Home</Link>
          <Link to="/dashboard" className="btn-coupon-clip justify-center px-5 py-3 text-sm"><Search className="h-4 w-4" />Browse listings</Link>
        </div>
      </section>
    </main>
  );
}
