import { Link } from "react-router-dom";
import { ArrowRight, Heart, House, MessageCircle } from "lucide-react";
import InfoPageShell from "./InfoPageShell";

const FEATURES = [
  {
    icon: House,
    title: "Browse homes",
    description: "Search listings by keyword and narrow results by price, property type, area, and amenities.",
  },
  {
    icon: Heart,
    title: "Keep a shortlist",
    description: "Save interesting places to your account and return to them from the Saved page.",
  },
  {
    icon: MessageCircle,
    title: "Talk directly",
    description: "Use listing conversations to ask owners about availability and arrange a viewing.",
  },
];

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About To-Let Mama"
      title="A clearer way to find a place"
      intro="To-Let Mama is a rental listings platform for people looking for a place to live and owners who want to share one. It brings discovery, shortlists, and conversations into one place."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <article key={title} className="glass-pane rounded-3xl p-6">
            <Icon className="h-6 w-6 text-[#5C3A21]" />
            <h2 className="mt-4 font-serif text-xl font-black text-[#2C1810]">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-[#5C3A21]">{description}</p>
          </article>
        ))}
      </section>
      <section className="glass-pane rounded-3xl p-6 lg:p-8">
        <h2 className="font-serif text-2xl font-black text-[#2C1810]">How it works</h2>
        <ol className="mt-5 grid gap-5 md:grid-cols-3">
          <li className="text-sm leading-7 text-[#5C3A21]"><strong className="text-[#2C1810]">1. Search</strong><br />Explore current listings and refine the results.</li>
          <li className="text-sm leading-7 text-[#5C3A21]"><strong className="text-[#2C1810]">2. Connect</strong><br />Save a place or message its owner with questions.</li>
          <li className="text-sm leading-7 text-[#5C3A21]"><strong className="text-[#2C1810]">3. Verify</strong><br />View the property and agree on details before making a commitment.</li>
        </ol>
        <Link to="/dashboard" className="btn-rubber-stamp mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm">
          Explore listings <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </InfoPageShell>
  );
}
