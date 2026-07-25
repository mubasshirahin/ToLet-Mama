import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValueEvent, useMotionValue } from "framer-motion";
import {
  Search, Shield, TrendingUp, Home,
  ArrowRight, Check, Plus, Minus, ChevronLeft, ChevronRight
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────

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

const sampleListings = [
  { id: 1, title: "Luxury Studio — Gulshan", price: "BDT 25,000/mo", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop" },
  { id: 2, title: "3BR Apartment — Banani", price: "BDT 45,000/mo", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop" },
  { id: 3, title: "Student Room — Dhanmondi", price: "BDT 8,000/mo", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop" },
  { id: 4, title: "Family Flat — Mirpur", price: "BDT 18,000/mo", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop" },
  { id: 5, title: "Penthouse — Baridhara", price: "BDT 85,000/mo", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop" },
];

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

const breakingNews = [
  "NEW LISTING IN GULSHAN • 2BR FLAT AT BDT 22,000/MO",
  "VERIFIED LANDLORD JOINS PLATFORM — 15 NEW PROPERTIES",
  "500+ ROOMS BOOKED THIS MONTH ACROSS DHAKA",
  "STUDENT SPECIAL: ROOMS NEAR BUET FROM BDT 6,000",
  "BANANI PENTHOUSE LISTED — FIRST MONTH HALF PRICE",
];

const sideStats = [
  { value: "42", label: "Tea Cups Drained Today" },
  { value: "7", label: "Pigeons on Roof. Yes." },
  { value: "3", label: "Snail Escapes. Case Unsolved." },
  { value: "0", label: "Important Things Happened." },
  { value: "47", label: "Ducks Spotted at Dhanmondi Lake" },
  { value: "12", label: "Lost Umbrellas. Unclaimed." },
];

const sideBulletins = [
  "LOST: A sock. Grey. Possibly striped. No reward. No questions asked.",
  "HOROSCOPE: You will read this whole bulletin and feel strangely satisfied.",
  "WEATHER: Cloudy with a 30% chance of someone asking \"is it going to rain?\"",
  "PERSONALS: Seeking a quiet room with no landlords who \"just pop in.\"",
  "FOR SALE: Slightly used bucket. Still holds water. Bargain.",
  "WANTED: Someone to water a cactus. Must not overwater.",
];

// ── Custom Hooks ──────────────────────────────────────────

function useAnimatedCounter(target, duration = 2, suffix = "") {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const elapsed = (time - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return { count: count.toLocaleString(), suffix, ref };
}

function useScrollDirection() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 600);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);
  return scrolled;
}

// ── Animation Variants ────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// ── Components ────────────────────────────────────────────

function SectionHeading({ label, title, className = "" }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className={`mb-14 ${className}`}
    >
      <p className="mb-2 font-serif text-[11px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
        {label}
      </p>
      <h2 className="font-serif text-4xl font-black leading-tight tracking-tight text-[#2C1810] lg:text-5xl">
        {title}
      </h2>
    </motion.div>
  );
}

function AnimatedStat({ value, label, suffix = "" }) {
  const { count, ref } = useAnimatedCounter(value, 2, suffix);
  return (
    <div ref={ref} className="flex flex-col items-center px-4 text-center border-r border-[#5C3A21]/20 last:border-0">
      <p className="font-serif text-3xl font-bold text-[#2C1810]">
        {count}{suffix}
      </p>
      <p className="mt-1.5 font-serif text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7A6B52]">
        {label}
      </p>
    </div>
  );
}

function ScrollReveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────

function LandingPage() {
  const scrolled = useScrollDirection();
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const carouselRef = useRef(null);
  const featuresSectionRef = useRef(null);
  const { scrollYProgress: featuresProgress } = useScroll({
    target: featuresSectionRef,
    offset: ["start start", "end end"],
  });
  const featuresTrackRef = useRef(null);
  const featuresMotionX = useMotionValue(0);
  const featuresCalcRef = useRef({ start: 0, range: 0 });

  // Measure actual track width and compute pixel translate values for centering
  useLayoutEffect(() => {
    const track = featuresTrackRef.current;
    if (!track) return;
    const cards = track.children;
    if (!cards.length) return;
    const cardEl = cards[0];
    const cardW = cardEl.offsetWidth;
    const trackW = track.scrollWidth;
    const vw = window.innerWidth;
    // Center offset = how many px to push right so first card is centered
    const centerOff = (vw - cardW) / 2;
    const startPx = centerOff;
    const endPx = centerOff - (trackW - cardW);
    featuresCalcRef.current = { start: startPx, range: endPx - startPx };
  }, []);

  const [activeFeature, setActiveFeature] = useState(0);
  useMotionValueEvent(featuresProgress, "change", (latest) => {
    const { start, range } = featuresCalcRef.current;
    featuresMotionX.set(start + latest * range);
    const idx = Math.min(features.length - 1, Math.floor(latest * features.length));
    setActiveFeature(idx);
  });

  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((p) => (p + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#2C1810]">
      {/* ═══════════════════════════════════════
          STICKY NAVBAR (appears on scroll)
          ═══════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: scrolled ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[#5C3A21]/20 bg-[#FAF3E0]/95 backdrop-blur-sm shadow-sm"
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-3">
          <Link to="/" className="font-serif text-lg font-black uppercase tracking-tight text-[#2C1810]">
            To-Let Mama
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {["Features", "How It Works", "Listings", "Pricing"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                className="font-serif text-xs font-semibold uppercase tracking-[0.12em] text-[#5C3A21] transition-colors hover:text-[#2C1810]"
              >{l}</a>
            ))}
            <div className="flex items-center gap-2">
              <Link to="/auth" className="btn-coupon-clip px-4 py-2 text-[10px]">Sign In</Link>
              <Link to="/signup" className="btn-rubber-stamp px-4 py-2 text-[11px]">Subscribe</Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ═══════════════════════════════════════
          SECTION 1: VINTAGE NEWSPAPER HERO
          ═══════════════════════════════════════ */}
      <section className="deckled-parent deckled-top deckled-bottom vintage-inset relative min-h-screen flex flex-col overflow-hidden">
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(60, 40, 20, 0.12) 85%, rgba(40, 25, 10, 0.18) 100%)" }} />
        {/* Paper texture */}
        <div className="absolute inset-0 z-0" style={{
          backgroundColor: "#F4E8C1",
          backgroundImage: `radial-gradient(ellipse at 15% 30%, rgba(139,119,75,0.06) 0%, transparent 60%),radial-gradient(ellipse at 85% 70%, rgba(139,119,75,0.05) 0%, transparent 50%),radial-gradient(ellipse at 50% 10%, rgba(210,190,140,0.08) 0%, transparent 40%),radial-gradient(ellipse at 30% 80%, rgba(120,100,60,0.04) 0%, transparent 50%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.045'/%3E%3C/svg%3E")`,
          backgroundBlendMode: "overlay, overlay, overlay, overlay, normal",
        }} />

        <div className="relative z-20 mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-6 py-6 md:px-10">
          {/* Masthead */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-1 mt-1 grid grid-cols-[auto_1fr] items-center gap-2">
            <div className="masthead-box justify-self-start border-2 border-[#2C1810] px-3 py-1.5">
              <p className="font-serif text-[9px] font-bold uppercase leading-tight tracking-[0.15em] text-[#5C3A21] md:text-[10px]">Extra</p>
              <p className="font-serif text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-[#2C1810] md:text-[11px]">Edition</p>
            </div>
            {/* Center: Newspaper Name */}
            <div className="text-center">
              <h1 className="font-serif text-2xl font-black uppercase leading-none tracking-tight text-[#2C1810] sm:text-3xl md:text-4xl lg:text-5xl">
                The Daily Gazette
              </h1>
            </div>
          </motion.div>

          <hr className="news-rule my-1.5" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-between font-serif text-[9px] uppercase tracking-[0.15em] text-[#5C3A21] md:text-[10px]">
            <span>Vol. IV, No. 28</span>
            <span className="hidden sm:inline">Dhaka, Friday — July 24, 2026</span>
            <span className="sm:hidden">Dhaka — Jul 24</span>
            <span>Price: One Taka</span>
          </motion.div>
          <hr className="news-rule-thick my-2" />
          <hr className="news-rule my-0.5" />

          {/* Main content grid */}
          <div className="mt-3 grid flex-1 grid-cols-1 gap-0 md:grid-cols-12 md:gap-4 lg:gap-6">
            {/* Left column — Local Briefs (muted filler, never competes visually) */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4 md:border-r md:border-[#7A6B52]/10 md:pr-4 md:col-span-2 max-w-[200px]">
              <div>
                <p className="mb-1 font-serif text-[9px] uppercase tracking-[0.15em] text-[#2C1810] opacity-55">Local Briefs</p>
                <hr className="news-rule mb-1.5 opacity-30" />
                {sideStats.map((s) => (
                  <div key={s.label} className="mb-2 border-b border-[#7A6B52]/5 pb-1.5 last:border-0 last:mb-0">
                    <p className="font-serif text-[11px] leading-none text-[#2C1810] opacity-65">{s.value}</p>
                    <p className="font-serif text-[8px] uppercase tracking-[0.15em] text-[#2C1810] opacity-55">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>            {/* Center: Headline + Photo */}
            <div className="flex flex-col md:col-span-8">
              {/* Main Headline */}
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                className="mb-2 font-serif text-3xl font-black leading-[0.92] tracking-tight text-[#2C1810] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                FIND YOUR PERFECT HOME<br />WITH <span className="underline decoration-[#5C3A21]/40">TO-LET MAMA</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
                className="mb-3 font-serif text-sm italic leading-snug text-[#5C3A21] md:text-base">
                The city&apos;s most trusted rental platform connects thousands of students with verified property owners across every neighbourhood.
              </motion.p>

              {/* Photo */}
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
                className="halftone-overlay relative mb-2 w-full">
                <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop"
                  alt="Dhaka city skyline at dusk"
                  className="w-full object-cover sepia-[60%] contrast-[1.1] brightness-[0.85] saturate-[0.6]"
                  style={{ maxHeight: "420px" }} />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.4 }}
                className="flex items-baseline gap-2 border-b border-[#2C1810] pb-1">
                <p className="font-serif text-[10px] font-bold uppercase tracking-[0.12em] text-[#2C1810]">Fig. 1 — DHAKA SKYLINE AT DUSK</p>
                <p className="font-serif text-[9px] italic text-[#5C3A21]">The city&apos;s skyline as seen from Hatirjheel</p>
              </motion.div>

              {/* Article body — fills the gap like real newspaper prose */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-6"
              >
                <div className="space-y-3">
                  <p className="font-serif text-[11px] leading-[1.7] text-[#5C3A21] md:text-xs">
                    DHAKA — In a city where the hunt for a decent rental has long been described as
                    &ldquo;the second hardest thing after surviving CNG rush hour,&rdquo; a quiet revolution
                    is underway. To-Let Mama, the capital&apos;s fastest-growing rental platform, has
                    reported a 300% increase in verified listings since the start of the year,
                    with neighbourhoods from Gulshan to Mirpur seeing unprecedented activity.
                  </p>
                  <p className="font-serif text-[11px] leading-[1.7] text-[#5C3A21] md:text-xs">
                    &ldquo;We are bridging the gap between students who need affordable housing and
                    owners who want reliable tenants,&rdquo; said a spokesperson. &ldquo;The days of
                    dealing with middlemen and dubious brokers are numbered.&rdquo; The platform&apos;s
                    dual-profile system allows users to toggle between student and landlord
                    roles, a feature that has proven especially popular among graduates who
                    later become property owners themselves.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-serif text-[11px] leading-[1.7] text-[#5C3A21] md:text-xs">
                    Industry analysts note that Dhaka&apos;s rental market, long characterised by
                    opaque pricing and informal agreements, is slowly maturing. &ldquo;Platforms
                    like To-Let Mama bring much-needed transparency,&rdquo; said one observer.
                    &ldquo;Verified listings, background checks, and secure communication channels
                    — these are not luxuries, they are basics that the market has lacked.&rdquo;
                  </p>
                  {/* Pull quote — classic newspaper device */}
                  <div className="border-l-2 border-[#2C1810]/30 pl-4 py-2">
                    <p className="font-serif text-[12px] italic leading-relaxed text-[#2C1810] md:text-sm opacity-80">
                      &ldquo;The days of dealing with dubious brokers are numbered.&rdquo;
                    </p>
                    <p className="mt-1 font-serif text-[8px] uppercase tracking-[0.15em] text-[#5C3A21] opacity-60">
                      — Platform Spokesperson
                    </p>
                  </div>
                  <p className="font-serif text-[11px] leading-[1.7] text-[#5C3A21] md:text-xs">
                    With the monsoon season approaching, demand is expected to surge further.
                    To-Let Mama has announced plans to expand into Chattogram and Sylhet by the
                    end of the year, bringing its verified rental ecosystem to the rest of
                    Bangladesh. &ldquo;This is just the beginning,&rdquo; the spokesperson added.
                  </p>
                  {/* Continued line */}
                  <p className="pt-1 font-serif text-[8px] uppercase tracking-[0.2em] text-[#7A6B52] opacity-60">
                    — Continued on Page A4
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right column — Classifieds (muted filler, never competes visually) */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4 md:border-l md:border-[#7A6B52]/10 md:pl-4 md:col-span-2 max-w-[200px]">
              <div>
                <p className="mb-1 font-serif text-[9px] uppercase tracking-[0.15em] text-[#2C1810] opacity-55">Classifieds</p>
                <hr className="news-rule mb-1.5 opacity-30" />
                {sideBulletins.map((text, i) => (
                  <div key={i} className="mb-2 border-b border-[#7A6B52]/5 pb-2 last:border-0 last:mb-0">
                    <p className="font-serif text-[9px] leading-relaxed text-justify text-[#2C1810] opacity-65">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <hr className="news-rule-thick mt-3 mb-1" />
          <div className="flex items-center justify-between font-serif text-[8px] uppercase tracking-[0.15em] text-[#5C3A21] md:text-[10px]">
            <span>Daily Weather: Fair, Mild &mdash; 32&deg;C</span>
            <span>Established 2022</span>
          </div>
        </div>
      </section>

      {/* ── Transition Fade ── */}
      <div className="fade-to-modern relative z-30 -mb-px" />

      {/* ═══════════════════════════════════════
          SECTION 2: BREAKING NEWS TICKER
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-y border-[#5C3A21]/20 bg-[#FAF3E0] overflow-hidden py-3 group"
      >
        <div className="marquee-track flex whitespace-nowrap group-hover:[animation-play-state:paused]">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex shrink-0 items-center gap-8 px-4">
              {breakingNews.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-3 font-serif text-xs font-semibold uppercase tracking-[0.12em] text-[#2C1810]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2C1810]" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          SECTION 3: FEATURES — HORIZONTAL SCROLL HIJACK
          ═══════════════════════════════════════ */}
      <section
        id="features"
        ref={featuresSectionRef}
        className="relative bg-[#FAF3E0]"
        style={{ height: `${features.length * 100}vh` }}
      >
        {/* Sticky viewport-fixed container */}
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-[#FAF3E0]">
          {/* Compact heading */}
          <div className="mx-auto w-full max-w-screen-xl px-6 pt-6 pb-1 md:pt-8 md:pb-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-block h-px w-6 bg-[#2C1810]/30" />
              <p className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                Why To-Let Mama
              </p>
              <span className="inline-block h-px flex-1 bg-[#2C1810]/30" />
            </div>
            <h2 className="font-serif text-2xl font-black leading-tight tracking-tight text-[#2C1810] md:text-3xl lg:text-4xl">
              Everything you need, all in one place.
</h2>
          </div>

          {/* Cards horizontal track */}
          <div className="flex flex-1 items-center overflow-visible">
            <motion.div
              ref={featuresTrackRef}
              style={{ x: featuresMotionX }}
              className="flex items-stretch gap-6 md:gap-8 lg:gap-8"
            >
              {features.map((f, i) => {
                const isActive = i === activeFeature;
                return (
                  <div
                    key={f.title}
                    className="relative shrink-0 w-[85vw] md:w-[50vw] lg:w-[420px] rounded-lg overflow-hidden"
                    style={{
                      transition: "transform 0.35s ease, opacity 0.35s ease, box-shadow 0.35s ease",
                      transform: isActive ? "scale(1.05)" : "scale(0.92)",
                      opacity: isActive ? 1 : 0.65,
                      boxShadow: isActive
                        ? "0 8px 32px rgba(44,24,16,0.15)"
                        : "0 4px 16px rgba(44,24,16,0.05)",
                    }}
                  >
                    {/* Card body */}
                    <div
                      className="flex h-full flex-col bg-[#FFFDF8]"
                      style={{
                        border: isActive
                          ? "1.5px solid rgba(44,24,16,0.6)"
                          : "1px solid rgba(44,24,16,0.12)",
                        transition: "border 0.35s ease",
                      }}
                    >
                      {/* Internal padding container */}
                      <div className="flex flex-1 flex-col justify-between px-8 py-8 md:px-9 md:py-9">
                        <div>
                          {/* Icon area with step badge */}
                          <div className="relative inline-block mb-4">
                            {/* Icon box */}
                            <div
                              className="flex h-14 w-14 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor: isActive ? "#2C1810" : "#EDE4D0",
                                transition: "background-color 0.35s ease",
                              }}
                            >
                              <f.icon
                                size={22}
                                style={{
                                  color: isActive ? "#FAF3E0" : "#2C1810",
                                  transition: "color 0.35s ease",
                                }}
                                strokeWidth={1.5}
                              />
                            </div>
                            {/* Step number badge - circle outline */}
                            <div
                              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FAF3E0]"
                              style={{
                                border: isActive
                                  ? "1.5px solid #2C1810"
                                  : "1px solid rgba(44,24,16,0.2)",
                                transition: "border 0.35s ease",
                              }}
                            >
                              <span
                                className="font-serif text-[8px] font-bold"
                                style={{
                                  color: isActive ? "#2C1810" : "rgba(44,24,16,0.4)",
                                  transition: "color 0.35s ease",
                                }}
                              >
                                {i + 1}
                              </span>
                            </div>
                          </div>

                          {/* Title */}
                          <h3
                            className="font-serif font-bold leading-snug mb-3"
                            style={{
                              fontSize: "clamp(20px, 2.2vw, 24px)",
                              color: isActive ? "#2C1810" : "#5C3A21",
                              transition: "color 0.35s ease",
                            }}
                          >
                            {f.title}
                          </h3>

                          {/* Description */}
                          <p
                            className="font-serif"
                            style={{
                              fontSize: "clamp(14px, 1.4vw, 15px)",
                              lineHeight: 1.6,
                              color: isActive ? "#5C3A21" : "#7A6B52",
                              transition: "color 0.35s ease",
                            }}
                          >
                            {f.desc}
                          </p>
                        </div>

                        {/* Bottom accent line - animated fill on active */}
                        <div className="mt-6 pt-5 relative">
                          <div
                            className="h-px w-full"
                            style={{
                              backgroundColor: isActive
                                ? "rgba(44,24,16,0.08)"
                                : "rgba(44,24,16,0.04)",
                              transition: "background-color 0.35s ease",
                            }}
                          />
                          {/* Active accent fill bar */}
                          <div
                            className="absolute top-5 left-0 h-px"
                            style={{
                              width: isActive ? "40%" : "0%",
                              backgroundColor: "#2C1810",
                              transition: "width 0.5s ease 0.1s",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Progress dots */}
          <div className="mx-auto w-full max-w-screen-xl px-6 pb-4 md:pb-5">
            <div className="flex items-center justify-center gap-2.5">
              {features.map((_, i) => (
                <button
                  key={i}
                  className="rounded-full border transition-all duration-500"
                  style={{
                    height: i === activeFeature ? 8 : 6,
                    width: i === activeFeature ? 20 : 6,
                    backgroundColor: i === activeFeature ? "#2C1810" : "transparent",
                    borderColor: i === activeFeature ? "#2C1810" : "rgba(44,24,16,0.2)",
                    transition: "all 0.35s ease",
                  }}
                  aria-label={`Go to feature ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4: HOW IT WORKS — STEP DECK
          ═══════════════════════════════════════ */}
      <section id="how-it-works" className="bg-[#2C1810] py-20 text-[#FAF3E0] lg:py-24 overflow-hidden">
        <div className="mx-auto max-w-screen-xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="mb-14">
            <p className="mb-2 font-serif text-[11px] font-bold uppercase tracking-[0.2em] text-[#A89880]">Simple Process</p>
            <h2 className="font-serif text-4xl font-black leading-tight tracking-tight lg:text-5xl">How it works.</h2>
          </motion.div>

          {/* Desktop: 4-column grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <ScrollReveal key={item.num} delay={i * 0.1}>
                <div className="relative group">
                  {/* Stamp badge */}
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#5C3A21] bg-transparent text-[#5C3A21] font-serif text-lg font-black transition-colors group-hover:bg-[#5C3A21] group-hover:text-[#FAF3E0]">
                    {item.num}
                  </div>
                  <h3 className="mb-3 font-serif text-xl font-bold text-[#FAF3E0]">{item.title}</h3>
                  <p className="font-serif text-sm leading-relaxed text-[#A89880]">{item.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden xl:block absolute top-8 -right-6 text-[#5C3A21] font-serif text-2xl">→</div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="flex md:hidden gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide">
            {steps.map((item, i) => (
              <ScrollReveal key={item.num} delay={i * 0.1}>
                <div className="snap-center shrink-0 w-[280px] border border-[#5C3A21]/30 p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#5C3A21] font-serif text-lg font-black text-[#5C3A21]">
                    {item.num}
                  </div>
                  <h3 className="mb-3 font-serif text-lg font-bold text-[#FAF3E0]">{item.title}</h3>
                  <p className="font-serif text-sm leading-relaxed text-[#A89880]">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5: LISTINGS CAROUSEL
          ═══════════════════════════════════════ */}
      <section id="listings" className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-screen-xl px-6">
          <SectionHeading label="Properties" title="Featured listings from across Dhaka." />

          <div className="relative">
            <div ref={carouselRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide -mx-6 px-6">
              {sampleListings.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 0.08}>
                  <motion.div whileHover={{ y: -4 }} className="snap-center shrink-0 w-[320px] bg-[#FAF3E0] border border-[#5C3A21]/20 overflow-hidden group">
                    {/* Image */}
                    <div className="halftone-overlay relative h-52 overflow-hidden">
                      <img src={item.img} alt={item.title}
                        className="w-full h-full object-cover sepia-[40%] contrast-[1.05] transition-transform duration-500 group-hover:scale-105" />
                      {/* FOR RENT stamp */}
                      <div className="absolute top-3 right-3 bg-[#2C1810] text-[#FAF3E0] font-serif text-[9px] font-bold uppercase tracking-[0.12em] px-3 py-1 rotate-6">
                        FOR RENT
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-serif text-base font-bold text-[#2C1810]">{item.title}</h3>
                      <p className="mt-1 font-serif text-sm text-[#5C3A21]">{item.price}</p>
                      <button className="mt-3 font-serif text-[10px] font-bold uppercase tracking-[0.15em] text-[#2C1810] underline underline-offset-4 decoration-[#5C3A21]/40 hover:decoration-[#2C1810] transition-all">
                        View Details →
                      </button>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
            {/* Gradient fade on edges */}
            <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6: STATS COUNTER
          ═══════════════════════════════════════ */}
      <section className="border-y border-[#5C3A21]/20 bg-[#FAF3E0] py-16">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#5C3A21]/20">
            {statsData.map((s) => (
              <AnimatedStat key={s.label} value={s.value} label={s.label} suffix={s.suffix || ""} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 7: TESTIMONIALS — LETTERS TO THE EDITOR
          ═══════════════════════════════════════ */}
      <section id="testimonials" className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-screen-xl px-6">
          <SectionHeading label="Testimonials" title="Letters to the editor." />

          <div className="relative max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="border border-[#5C3A21]/20 bg-[#FAF3E0] p-8 md:p-12"
              >
                <p className="mb-6 font-serif text-5xl font-black leading-none text-[#A89880]">&ldquo;</p>
                <p className="mb-8 font-serif text-lg italic leading-relaxed text-[#2C1810]">
                  {testimonials[activeTestimonial].text}
                </p>
                <div className="flex items-center gap-4 border-t border-[#5C3A21]/20 pt-5">
                  {/* Sepia avatar */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8D5A3] font-serif text-sm font-bold text-[#2C1810] border-2 border-[#5C3A21]/30 sepia">
                    {testimonials[activeTestimonial].initials}
                  </div>
                  <div>
                    <p className="font-serif text-sm font-bold text-[#2C1810]">{testimonials[activeTestimonial].name}</p>
                    <p className="font-serif text-[10px] uppercase tracking-[0.15em] text-[#7A6B52]">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={prevTestimonial}
                className="flex h-10 w-10 items-center justify-center border-2 border-[#5C3A21]/30 text-[#5C3A21] transition-all hover:bg-[#2C1810] hover:text-white hover:border-[#2C1810]">
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setActiveTestimonial(i)}
                    className={`h-2.5 w-2.5 rounded-full border transition-all ${i === activeTestimonial ? "bg-[#2C1810] border-[#2C1810]" : "bg-transparent border-[#5C3A21]/40 hover:border-[#2C1810]"}`}
                  />
                ))}
              </div>
              <button onClick={nextTestimonial}
                className="flex h-10 w-10 items-center justify-center border-2 border-[#5C3A21]/30 text-[#5C3A21] transition-all hover:bg-[#2C1810] hover:text-white hover:border-[#2C1810]">
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 8: CLASSIFIED ADS
          ═══════════════════════════════════════ */}
      <section className="bg-[#2C1810] py-16">
        <div className="mx-auto max-w-screen-xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10">
            <p className="mb-2 font-serif text-[11px] font-bold uppercase tracking-[0.2em] text-[#A89880]">Classifieds</p>
            <h2 className="font-serif text-3xl font-black leading-tight tracking-tight text-[#FAF3E0]">Special offers &amp; announcements.</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {classifieds.map((ad, i) => (
              <motion.div key={ad.title} variants={fadeUp} custom={i}
                className="border border-[#5C3A21]/40 p-5 bg-[#1A0F0A] transition-all hover:bg-[#2C1810] hover:-translate-y-0.5">
                <h3 className="font-serif text-sm font-bold text-[#FAF3E0] mb-2">{ad.title}</h3>
                <p className="font-serif text-xs leading-relaxed text-[#A89880] mb-4">{ad.desc}</p>
                <button className="font-serif text-[10px] font-bold uppercase tracking-[0.15em] text-[#A89880] underline underline-offset-4 decoration-[#5C3A21]/40 hover:text-[#FAF3E0] hover:decoration-[#FAF3E0] transition-all">
                  {ad.cta} →
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 9: PRICING PLANS
          ═══════════════════════════════════════ */}
      <section id="pricing" className="bg-[#FAF3E0] py-20 lg:py-24">
        <div className="mx-auto max-w-screen-xl px-6">
          <SectionHeading label="Pricing" title="Choose your plan." />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name} variants={fadeUp} custom={i}
                className={`relative bg-white border ${plan.popular ? "border-[#2C1810] ring-1 ring-[#2C1810]" : "border-[#5C3A21]/20"} p-8 transition-all hover:-translate-y-1 hover:shadow-lg
                  before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#5C3A21]/30 before:to-transparent
                  after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#5C3A21]/30 after:to-transparent`}
                style={{
                  // Perforated edges visual — dashed with circle cutout effect
                  borderImage: `repeating-linear-gradient(90deg, #5C3A21 0px, #5C3A21 6px, transparent 6px, transparent 10px) 1`,
                  borderImageSlice: plan.popular ? undefined : undefined,
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2C1810] text-[#FAF3E0] font-serif text-[9px] font-bold uppercase tracking-[0.15em] px-4 py-1">
                    BEST VALUE
                  </div>
                )}
                <p className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21] mb-1">{plan.name}</p>
                <p className="font-serif text-3xl font-black text-[#2C1810] mb-1">{plan.price}</p>
                <p className="font-serif text-xs text-[#7A6B52] mb-6">{plan.period}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 font-serif text-xs text-[#5C3A21]">
                      <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#2C1810]" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup"
                  className={`block text-center py-3 font-serif text-xs font-bold uppercase tracking-[0.15em] transition-all ${plan.popular
                    ? "bg-[#2C1810] text-[#FAF3E0] hover:bg-[#5C3A21]"
                    : "border border-[#5C3A21]/30 text-[#2C1810] hover:bg-[#2C1810] hover:text-[#FAF3E0]"
                  }`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 10: FAQ — Q&A COLUMN
          ═══════════════════════════════════════ */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-screen-xl px-6">
          <SectionHeading label="Q&A Column" title="Frequently asked questions." />

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="border border-[#5C3A21]/20 bg-[#FAF3E0] overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[#F0E4C0]"
                  >
                    <span className="font-serif text-sm font-bold text-[#2C1810] pr-4">{faq.q}</span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center border border-[#5C3A21]/30 text-[#5C3A21] transition-all ${activeFaq === i ? "bg-[#2C1810] text-[#FAF3E0] border-[#2C1810]" : ""}`}>
                      {activeFaq === i ? <Minus className="h-3 w-3" strokeWidth={2} /> : <Plus className="h-3 w-3" strokeWidth={2} />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0 border-t border-[#5C3A21]/10">
                          <p className="font-serif text-sm leading-relaxed text-[#5C3A21]">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 11: FINAL CTA WITH PARALLAX
          ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#2C1810] py-24">
        {/* Parallax background texture */}
        <motion.div
          style={{
            y: bgY,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "300px 300px",
          }}
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
        />
        <div className="relative z-10 mx-auto max-w-screen-xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <p className="mb-3 font-serif text-[11px] font-bold uppercase tracking-[0.2em] text-[#A89880]">Final Edition</p>
            <h2 className="font-serif text-4xl font-black leading-tight tracking-tight text-[#FAF3E0] lg:text-5xl">
              Your perfect home is<br />one click away.
            </h2>
            <p className="mx-auto mt-5 max-w-md font-serif text-base leading-relaxed text-[#A89880]">
              Join thousands of students and house owners already using To-Let Mama across Dhaka.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} className="mt-10 flex flex-wrap justify-center gap-6">
              <Link to="/signup" className="btn-rubber-stamp border-[#FAF3E0] text-[#FAF3E0] hover:bg-[#FAF3E0] hover:text-[#2C1810]">
                Subscribe Now <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link to="/auth" className="btn-coupon-clip border-[#A89880] text-[#A89880] hover:border-[#FAF3E0] hover:text-[#FAF3E0]">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 12: FOOTER
          ═══════════════════════════════════════ */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
        }}
        className="relative bg-[#FAF3E0] border-t border-[#5C3A21]/20"
      >
        {/* Torn paper edge at the very top of footer */}
        <div className="absolute -top-4 left-0 right-0 h-4 bg-[#FAF3E0] deckled-top" />

        <div className="mx-auto max-w-screen-xl px-6 pt-12 pb-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="font-serif text-xl font-black uppercase tracking-tight text-[#2C1810]">To-Let Mama</span>
              <p className="mt-4 max-w-xs font-serif text-sm leading-relaxed text-[#5C3A21]">
                The Dhaka Rental Authority. Connecting students and house owners since 2022. Verified listings. Real people. No nonsense.
              </p>
              <div className="mt-6 flex gap-3">
                {["F", "T", "I"].map((letter) => (
                  <div key={letter}
                    className="flex h-8 w-8 items-center justify-center border border-[#5C3A21]/30 font-serif text-xs font-bold text-[#5C3A21] transition-all hover:bg-[#2C1810] hover:text-[#FAF3E0] hover:border-[#2C1810] cursor-pointer"
                    aria-label={`${letter === "F" ? "Facebook" : letter === "T" ? "Twitter" : "Instagram"}`}>
                    <span>{letter}</span>
                  </div>
                ))}
              </div>
              {/* Established stamp */}
              <div className="mt-6 inline-block border-2 border-[#5C3A21]/30 px-4 py-1.5 rotate-[-1deg]">
                <p className="font-serif text-[9px] font-bold uppercase tracking-[0.15em] text-[#5C3A21]">Est. 2022</p>
              </div>
            </div>

            {[
              { title: "Company", links: [{ label: "About", to: "#" }, { label: "Careers", to: "#" }, { label: "Press", to: "#" }, { label: "Blog", to: "#" }] },
              { title: "Support", links: [{ label: "Help Center", to: "#" }, { label: "Safety", to: "#" }, { label: "Community", to: "#" }, { label: "Contact", to: "#" }] },
              { title: "Legal", links: [{ label: "Privacy", to: "#" }, { label: "Terms", to: "#" }, { label: "Cookies", to: "#" }, { label: "Accessibility", to: "#" }] },
              { title: "Pages", links: [{ label: "Sign In", to: "/auth" }, { label: "Subscribe", to: "/signup" }, { label: "Dashboard", to: "/dashboard" }, { label: "Listings", to: "#listings" }] },
            ].map((col) => (
              <div key={col.title} className="md:col-span-2">
                <p className="mb-4 font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="font-serif text-sm text-[#5C3A21] transition-colors hover:text-[#2C1810]">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#5C3A21]/20 pt-6 md:flex-row">
            <p className="font-serif text-[10px] uppercase tracking-[0.15em] text-[#7A6B52]">&copy; 2026 To-Let Mama. All rights reserved.</p>
            <p className="font-serif text-[10px] uppercase tracking-[0.15em] text-[#A89880]">Printed in Dhaka</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default LandingPage;
