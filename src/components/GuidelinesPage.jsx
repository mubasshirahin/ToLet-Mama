import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck } from "lucide-react";
import InfoPageShell from "./InfoPageShell";

const CHECKLIST = [
  "Visit the property in person or arrange a live video tour before paying.",
  "Confirm the owner's identity and that they are allowed to rent the property.",
  "Check the room, utilities, access, house rules, and move-in date yourself.",
  "Agree on rent, deposit, bills, notice period, and refund terms in writing.",
  "Use a traceable payment method and keep receipts and messages.",
  "Do not share passwords, verification codes, or sensitive identity documents in chat.",
];

const OWNER_GUIDANCE = [
  "Use accurate photos, rent, location, availability, and amenity details.",
  "Do not request payment before a renter has had a reasonable chance to view the property.",
  "Keep conversations respectful and respond clearly about fees and house rules.",
  "Remove or update a listing when the property is no longer available.",
];

export default function GuidelinesPage() {
  return (
    <InfoPageShell
      eyebrow="Community"
      title="Rental Guidelines"
      intro="Practical steps for safer conversations and clearer listings. These checks help you make an informed decision; always verify details directly."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="glass-pane rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-[#5C3A21]" />
            <h2 className="font-serif text-2xl font-black text-[#2C1810]">For renters</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-[#5C3A21]">Before you commit or transfer money, work through this checklist.</p>
          <ul className="mt-6 space-y-4">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-[#5C3A21]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6A42]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-pane rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6 text-[#5C3A21]" />
            <h2 className="font-serif text-2xl font-black text-[#2C1810]">For owners</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-[#5C3A21]">Clear information helps renters decide whether a viewing is right for them.</p>
          <ul className="mt-6 space-y-4">
            {OWNER_GUIDANCE.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-[#5C3A21]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6A42]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="glass-pane rounded-3xl p-6 lg:p-8">
        <h2 className="font-serif text-2xl font-black text-[#2C1810]">Use the platform thoughtfully</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5C3A21]">
          Keep messages relevant, do not post misleading or discriminatory content, and report suspicious activity through the Help Center. To start browsing, return to the listings page.
        </p>
        <Link to="/dashboard" className="btn-rubber-stamp mt-5 inline-flex items-center gap-2 px-5 py-3 text-sm">
          Browse listings <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </InfoPageShell>
  );
}
