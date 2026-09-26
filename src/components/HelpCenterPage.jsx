import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Mail, Search } from "lucide-react";
import InfoPageShell from "./InfoPageShell";

const FAQS = [
  {
    category: "Accounts",
    question: "Who can create a student account?",
    answer: "Student Google sign-in accepts university addresses with .edu or .ac domains. Choose Owner if you are listing a property with a personal email.",
  },
  {
    category: "Accounts",
    question: "How do I update my profile?",
    answer: "Open Profile from the sidebar to update your name, phone number, city, and bio.",
  },
  {
    category: "Finding a place",
    question: "How do I narrow down listings?",
    answer: "Use the search field for a keyword, then open Filters to choose a price band, property type, area, and amenities. Sort and grid/list controls update the results immediately.",
  },
  {
    category: "Finding a place",
    question: "How do I save a listing?",
    answer: "Use the heart button on a listing card or detail page. Saved listings appear under Saved in the sidebar.",
  },
  {
    category: "Messaging",
    question: "How do I contact a property owner?",
    answer: "Open a listing and choose Contact owner. Your conversation is available from Messages in the sidebar.",
  },
  {
    category: "Owners",
    question: "How do I publish a property?",
    answer: "Sign in with the Owner role, choose Add Listing, complete the property details, and submit the form. You can edit or remove your listings from My Listings.",
  },
  {
    category: "Safety",
    question: "What should I check before paying?",
    answer: "See the rental safety checklist in Guidelines. Visit the property, confirm who you are dealing with, and agree on written terms before sending money.",
  },
];

const CATEGORIES = ["All", ...new Set(FAQS.map((item) => item.category))];

export default function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openQuestion, setOpenQuestion] = useState(FAQS[0].question);

  const visibleFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return FAQS.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery = !normalizedQuery
        || [item.question, item.answer, item.category].join(" ").toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <InfoPageShell
      eyebrow="Support"
      title="Help Center"
      intro="Quick answers for finding a home, managing a listing, and using your account."
    >
      <section className="glass-pane rounded-3xl p-5 lg:p-7">
        <label className="flex items-center gap-3 rounded-2xl border border-[#5C3A21]/20 bg-[var(--theme-surface)] px-4 py-3">
          <Search className="h-4 w-4 text-[#A89880]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help topics"
            className="w-full bg-transparent text-sm text-[#2C1810] outline-none placeholder:text-[#A89880]"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Help topics">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={"rounded-full border px-4 py-2 text-xs font-bold transition-colors " + (
                category === item
                  ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                  : "border-[#5C3A21]/20 text-[#5C3A21] hover:bg-[var(--theme-surface)]"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 divide-y divide-[#5C3A21]/15">
          {visibleFaqs.map((item) => {
            const isOpen = openQuestion === item.question;
            return (
              <article key={item.question} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.15em] text-[#A89880]">{item.category}</span>
                    <span className="font-serif text-base font-bold text-[#2C1810]">{item.question}</span>
                  </span>
                  <ChevronDown className={"h-4 w-4 shrink-0 text-[#5C3A21] transition-transform " + (isOpen ? "rotate-180" : "")} />
                </button>
                {isOpen && <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5C3A21]">{item.answer}</p>}
              </article>
            );
          })}
          {visibleFaqs.length === 0 && (
            <p className="py-8 text-center text-sm text-[#5C3A21]">No help articles match that search. Try another keyword or category.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass-pane rounded-3xl p-6">
          <Mail className="h-5 w-5 text-[#5C3A21]" />
          <h2 className="mt-4 font-serif text-xl font-black text-[#2C1810]">Still need help?</h2>
          <p className="mt-2 text-sm leading-6 text-[#5C3A21]">Send a message with the page you were using and what happened.</p>
          <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#2C1810] underline" href="mailto:support@toletmama.com">
            Email support <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="glass-pane rounded-3xl p-6">
          <h2 className="font-serif text-xl font-black text-[#2C1810]">Stay safe while renting</h2>
          <p className="mt-2 text-sm leading-6 text-[#5C3A21]">Use the checklist before viewing a property or sending a deposit.</p>
          <Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#2C1810] underline" to="/guidelines">
            Read the guidelines <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </InfoPageShell>
  );
}
