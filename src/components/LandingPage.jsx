import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Search, Shield, TrendingUp, Home, ArrowRight, Check, Plus, Minus, MapPin, Building2, Star,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";


// ── Data (content + routes preserved from previous landing) ──────────────

const features = [
  { icon: Search, title: "Smart Search", desc: "Find your ideal room or tenant with intelligent filters — budget, location, amenities, and more." },
  { icon: Shield, title: "Verified Listings", desc: "Every property is personally verified by our team before it goes live. No scams, no surprises." },
  { icon: TrendingUp, title: "Real-Time Updates", desc: "Get instant notifications when a new listing matches your criteria or when someone shows interest." },
  { icon: Home, title: "Premium Properties", desc: "Handpicked listings from Dhaka's finest neighbourhoods — Gulshan, Banani, Dhanmondi and beyond." },
];

const steps = [
  { num: "01", title: "Search", desc: "Browse thousands of verified listings across all major Dhaka neighbourhoods with smart filters." },
  { num: "02", title: "Compare", desc: "Side-by-side comparisons of rent, amenities, location scores, and landlord ratings." },
  { num: "03", title: "Verify", desc: "Every property and tenant is verified by our team before any contact is made." },
  { num: "04", title: "Move In", desc: "Chat directly, schedule visits, and finalise your rental — all on the platform." },
];

const sampleListings = [];

const testimonials = [
  { name: "Rafsan Islam", role: "Student, BUET", text: "Found my perfect room near campus in just 3 days. The verified listings gave me peace of mind.", initials: "RI" },
  { name: "Sharmin Akhter", role: "House Owner, Gulshan", text: "Listed my apartment and got 5 qualified tenants within a week. To-Let Mama made it effortless.", initials: "SA" },
  { name: "Tanvir Ahmed", role: "Student, DU", text: "The filtering made it easy to find a place within my budget. Highly recommend!", initials: "TA" },
  { name: "Nusrat Jahan", role: "Tenant, Banani", text: "The neighbourhood guides helped me pick the right area. Found a gem within 2 days.", initials: "NJ" },
  { name: "Kamal Hossain", role: "Landlord, Mirpur", text: "Zero vacancies since I joined. Quality tenants, no hassle, no nonsense.", initials: "KH" },
];

const classifieds = [
  { title: "List Your Property Free", desc: "First 30 days free for new landlords. Zero commission.", cta: "Start Listing" },
  { title: "First Month Free Browsing", desc: "New tenants get premium access free for 30 days.", cta: "Browse Now" },
  { title: "Verified Tenants Only", desc: "Every tenant is background-checked. No time-wasters.", cta: "Learn More" },
  { title: "Instant Alerts", desc: "Get notified the moment a listing matches your criteria.", cta: "Set Alerts" },
];

const pricingPlans = [
  { name: "Starter", price: "Free", period: "forever", features: ["Browse listings", "Basic filters", "Email alerts", "Public profile"], popular: false },
  { name: "Premium", price: "BDT 299", period: "/month", features: ["All Starter features", "Advanced filters", "Priority support", "Verified badge", "Unlimited saves"], popular: true },
  { name: "Pro Landlord", price: "BDT 999", period: "/month", features: ["Unlimited listings", "Featured placement", "Analytics dashboard", "Tenant screening", "Dedicated agent"], popular: false },
];

const statsData = [
  { value: 2547, label: "Active Listings" },
  { value: 15280, label: "Happy Tenants" },
  { value: 49, label: "Avg. Rating", suffix: "" },
  { value: 98, label: "Satisfaction", suffix: "%" },
];

const faqs = [
  { q: "How do I verify my account?", a: "Upload a valid ID (NID, passport, or student ID). Our team reviews and approves within 24 hours. You'll receive a confirmation email once verified." },
  { q: "Is there any listing fee?", a: "Standard listings are free for the first 30 days. Premium and Pro Landlord plans offer additional features like featured placement and analytics." },
  { q: "How do I contact the landlord?", a: "Once you find a listing you like, click 'Express Interest.' The landlord will be notified and can initiate a chat through our secure messaging system." },
  { q: "Can I switch between tenant and landlord profiles?", a: "Absolutely. With Dual Profiles, you can seamlessly switch between roles from your dashboard using a single account." },
  { q: "What areas does To-Let Mama cover?", a: "We currently cover all major Dhaka neighbourhoods including Gulshan, Banani, Dhanmondi, Mirpur, Uttara, Baridhara, and Mohammadpur. More areas coming soon." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

function SectionHeading({ label, title }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="mb-10 text-center">
      <p className="mb-2 font-serif text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--theme-ink-muted)]">{label}</p>
      <h2 className="font-serif text-3xl font-black tracking-tight md:text-4xl lg:text-5xl" style={{ color: "var(--theme-ink)" }}>{title}</h2>
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────────

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const nextTestimonial = useCallback(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), []);
  const prevTestimonial = useCallback(() => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length), []);

  return (
    <div className="relative min-h-screen overflow-x-clip" style={{ background: "transparent", color: "var(--theme-ink)" }}>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="glass-pane mx-auto mt-3 flex max-w-screen-xl items-center justify-between rounded-full px-6 py-3">
          <Link to="/" className="font-serif text-lg font-black uppercase tracking-tight" style={{ color: "var(--theme-ink)" }}>
            To-Let Mama
          </Link>
          <ThemeToggle compact className="md:hidden" />
          <div className="hidden items-center gap-6 md:flex">
            {["Features", "How It Works", "Listings", "Pricing"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                className="font-serif text-xs font-semibold uppercase tracking-[0.12em] transition-colors"
                style={{ color: "var(--theme-ink-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-ink-muted)")}
              >{l}</a>
            ))}
            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <Link to="/auth" className="rounded-full border px-4 py-2 text-xs font-semibold" style={{ borderColor: "var(--theme-border-strong)" }}>Sign In</Link>
              <Link to="/signup" className="rounded-full px-4 py-2 text-xs font-semibold" style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}>Subscribe</Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── SECTION 1: HERO ── */}
      <section id="hero" className="relative flex min-h-screen flex-col justify-center overflow-visible">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 mx-auto w-full max-w-screen-xl px-6 pt-28 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full glass-pane px-4 py-1.5 font-serif text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>
            <MapPin className="h-3.5 w-3.5" strokeWidth={2} /> The Dhaka Rental Authority
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
            className="font-serif text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl">
            Find What<br /><span className="italic font-medium" style={{ color: "var(--theme-ink-muted)" }}>Moves You.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>
            Verified rooms, flats, and tenants across Dhaka. Scroll the city — every turn brings you closer to home.
          </motion.p>

          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
            onClick={(e) => e.preventDefault()}
            className="mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-full glass-pane-strong p-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 shrink-0" style={{ color: "var(--theme-ink-muted)" }} strokeWidth={2} />
              <input
                type="text"
                placeholder="Search by area, budget, or amenities…"
                className="w-full bg-transparent font-serif text-sm outline-none placeholder:opacity-60"
                style={{ color: "var(--theme-ink)" }}
              />
            </div>
            <Link to="/listings" className="shrink-0 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em]" style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}>
              Search
            </Link>
          </motion.form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara"].map((area) => (
              <span key={area} className="font-serif text-xs uppercase tracking-[0.15em] opacity-60" style={{ color: "var(--theme-ink-muted)" }}>
                {area}
              </span>
            ))}
          </motion.div>

        </motion.div>
      </section>


      {/* ── SECTION 3: FEATURES ── */}
      <section id="features" className="relative py-24">
        <div className="mx-auto max-w-screen-xl px-6">
          <SectionHeading label="Why To-Let Mama" title="Everything you need, all in one place." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} custom={i}
                className="group glass-pane rounded-2xl p-6 transition-all hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}>
                  <f.icon size={20} strokeWidth={2} />
                </div>
                <h3 className="mb-2 font-serif text-lg font-bold">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative py-24">
        <div className="mx-auto max-w-screen-xl px-6">
          <SectionHeading label="Simple Process" title="How it works." />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {steps.map((item, i) => (
              <motion.div key={item.num} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} custom={i}
                className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full font-serif text-lg font-black" style={{ border: "2px solid var(--theme-ink)", color: "var(--theme-ink)" }}>
                  {item.num}
                </div>
                <h3 className="mb-2 font-serif text-xl font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: LISTINGS ── */}
      <section id="listings" className="relative py-24">
        <div className="mx-auto max-w-screen-xl px-6">
          <SectionHeading label="Properties" title="Featured listings from across Dhaka." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleListings.map((item, i) => (
              <motion.div key={item.id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} custom={i}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group glass-pane overflow-hidden rounded-2xl transition-shadow hover:shadow-2xl">
                <div className="relative h-52 overflow-hidden">
                  <img src={item.img} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}>
                    FOR RENT
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-1 flex items-center gap-1 text-xs" style={{ color: "var(--theme-ink-faded)" }}>
                    <Star className="h-3 w-3 fill-current" /> 4.8 · {item.title.split("—")[1]?.trim() || "Dhaka"}
                  </div>
                  <h3 className="font-serif text-base font-bold">{item.title}</h3>
                  <p className="mt-1 font-serif text-sm" style={{ color: "var(--theme-ink-muted)" }}>{item.price}</p>
                  <Link to={`/listings/${item.id}`}
                    state={{ listing: { ...item, price: item.price, image: item.img, images: [item.img] } }}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink)" }}>
                    View Details <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative py-16">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {statsData.map((s) => (
              <div key={s.label} className="glass-pane rounded-2xl p-6 text-center">
                <p className="font-serif text-3xl font-black md:text-4xl">{s.value.toLocaleString()}{s.suffix || ""}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-24">
        <div className="mx-auto max-w-screen-xl px-6">
          <SectionHeading label="Pricing" title="Choose your plan." />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} custom={i}
                className={`relative glass-pane rounded-2xl p-8 transition-all hover:-translate-y-1 ${plan.popular ? "ring-2" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}>
                    BEST VALUE
                  </div>
                )}
                <p className="mb-1 font-serif text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>{plan.name}</p>
                <p className="mb-1 font-serif text-3xl font-black">{plan.price}</p>
                <p className="mb-6 text-xs" style={{ color: "var(--theme-ink-faded)" }}>{plan.period}</p>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} style={{ color: "var(--theme-ink-muted)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="block rounded-full py-3 text-center font-serif text-xs font-bold uppercase tracking-[0.15em]"
                  style={plan.popular
                    ? { background: "var(--theme-ink)", color: "var(--theme-bg)" }
                    : { border: "1px solid var(--theme-border-strong)" }}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: TESTIMONIALS (camera pull-back + starfield resolve) ── */}
      <section id="testimonials" className="relative py-24">
        <div className="glass-pane-strong mx-auto max-w-3xl rounded-3xl px-6 py-16">
          <SectionHeading label="Testimonials" title="Letters from the city." />
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-8 text-center md:p-10"
                style={{ background: "color-mix(in srgb, var(--theme-surface) 80%, transparent)" }}
              >
                <p className="mb-4 font-serif text-5xl font-black leading-none opacity-30">&ldquo;</p>
                <p className="mb-6 font-serif text-lg italic leading-relaxed">{testimonials[activeTestimonial].text}</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full font-serif text-sm font-bold" style={{ background: "var(--theme-surface-3)", color: "var(--theme-ink)" }}>
                    {testimonials[activeTestimonial].initials}
                  </div>
                  <div className="text-left">
                    <p className="font-serif text-sm font-bold">{testimonials[activeTestimonial].name}</p>
                    <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-muted)" }}>{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button onClick={prevTestimonial} aria-label="Previous testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full" style={{ border: "1px solid var(--theme-border-strong)" }}>
                <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={2} />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setActiveTestimonial(i)} aria-label={`Testimonial ${i + 1}`}
                    className="h-2.5 w-2.5 rounded-full transition-all"
                    style={{ background: i === activeTestimonial ? "var(--theme-ink)" : "transparent", border: "1px solid var(--theme-border-strong)" }} />
                ))}
              </div>
              <button onClick={nextTestimonial} aria-label="Next testimonial"
                className="flex h-10 w-10 items-center justify-center rounded-full" style={{ border: "1px solid var(--theme-border-strong)" }}>
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLASSIFIEDS + FAQ ── */}
      <section className="relative py-16">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Classifieds */}
            <div className="glass-pane rounded-3xl p-8">
              <p className="mb-6 font-serif text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--theme-ink-muted)" }}>Classifieds</p>
              <div className="space-y-4">
                {classifieds.map((ad) => (
                  <div key={ad.title} className="flex items-start justify-between gap-4 rounded-2xl p-4" style={{ background: "var(--theme-surface)" }}>
                    <div>
                      <h3 className="font-serif text-sm font-bold">{ad.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>{ad.desc}</p>
                    </div>
                    <button className="shrink-0 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink)" }}>{ad.cta} →</button>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="glass-pane rounded-3xl p-8">
              <p className="mb-6 font-serif text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--theme-ink-muted)" }}>Q&A</p>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl" style={{ background: "var(--theme-surface)" }}>
                    <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="flex w-full items-center justify-between p-4 text-left transition-colors">
                      <span className="pr-4 font-serif text-sm font-bold">{faq.q}</span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ border: "1px solid var(--theme-border-strong)" }}>
                        {activeFaq === i ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {activeFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                          <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-24">
        <div className="mx-auto max-w-screen-xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <p className="mb-3 font-serif text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>Final Edition</p>
            <h2 className="font-serif text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Your perfect home is<br />one click away.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>
              Join thousands of students and house owners already using To-Let Mama across Dhaka.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <Link to="/signup" className="rounded-full px-8 py-3 font-serif text-xs font-bold uppercase tracking-[0.15em]" style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}>
                Subscribe Now <ArrowRight className="ml-1 inline h-4 w-4" strokeWidth={2} />
              </Link>
              <Link to="/auth" className="rounded-full border px-8 py-3 font-serif text-xs font-bold uppercase tracking-[0.15em]" style={{ borderColor: "var(--theme-border-strong)" }}>
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER (translucent — starfield resolves through) ── */}
      <footer className="relative border-t pt-14" style={{ borderColor: "var(--theme-border)" }}>
        <div className="mx-auto max-w-screen-xl px-6 pb-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="mb-4 inline-flex items-center gap-2">
                <Building2 className="h-5 w-5" strokeWidth={2} style={{ color: "var(--theme-ink-muted)" }} />
                <span className="font-serif text-xl font-black uppercase tracking-tight">To-Let Mama</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>
                The Dhaka Rental Authority. Connecting students and house owners since 2022. Verified listings. Real people. No nonsense.
              </p>
              <div className="mt-6 flex gap-3">
                {["F", "T", "I"].map((letter) => (
                  <div key={letter} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-colors"
                    style={{ border: "1px solid var(--theme-border)", color: "var(--theme-ink-muted)" }}
                    aria-label={`${letter === "F" ? "Facebook" : letter === "T" ? "Twitter" : "Instagram"}`}>
                    {letter}
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: "Company", links: [{ label: "About", to: "#" }, { label: "Careers", to: "#" }, { label: "Press", to: "#" }, { label: "Blog", to: "#" }] },
              { title: "Support", links: [{ label: "Help Center", to: "#" }, { label: "Safety", to: "#" }, { label: "Community", to: "#" }, { label: "Contact", to: "#" }] },
              { title: "Legal", links: [{ label: "Privacy", to: "#" }, { label: "Terms", to: "#" }, { label: "Cookies", to: "#" }, { label: "Accessibility", to: "#" }] },
              { title: "Pages", links: [{ label: "Sign In", to: "/auth" }, { label: "Subscribe", to: "/signup" }, { label: "Dashboard", to: "/dashboard" }, { label: "Listings", to: "#listings" }] },
            ].map((col) => (
              <div key={col.title} className="md:col-span-2">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-sm transition-colors" style={{ color: "var(--theme-ink-muted)" }}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 md:flex-row" style={{ borderColor: "var(--theme-border)" }}>
            <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-faded)" }}>&copy; 2026 To-Let Mama. All rights reserved.</p>
            <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-faded)" }}>Built in Dhaka</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
