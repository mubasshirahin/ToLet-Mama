import { Link } from "react-router-dom";
import { Newspaper, Search, Shield, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    desc: "Find your ideal room or tenant with intelligent filters — budget, location, amenities, and more.",
  },
  {
    icon: Shield,
    title: "Verified Listings",
    desc: "Every property is personally verified by our team before it goes live. No scams, no surprises.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Updates",
    desc: "Get instant notifications when a new listing matches your criteria or when someone shows interest.",
  },
  {
    icon: Users,
    title: "Dual Profiles",
    desc: "Switch seamlessly between Student and House Owner profiles — one account, two roles.",
  },
];

const testimonials = [
  {
    name: "Rafsan Islam",
    role: "Student, BUET",
    text: "Found my perfect room near campus in just 3 days. The verified listings gave me peace of mind.",
    initials: "RI",
  },
  {
    name: "Sharmin Akhter",
    role: "House Owner, Gulshan",
    text: "Listed my apartment and got 5 qualified tenants within a week. ToLet Mama made it effortless.",
    initials: "SA",
  },
  {
    name: "Tanvir Ahmed",
    role: "Student, DU",
    text: "The filtering made it easy to find a place within my budget. Highly recommend to fellow students!",
    initials: "TA",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] font-body text-[#111111] sharp-corners">
      {/* ─── Edition Bar ─── */}
      <div className="border-b border-[#111111] bg-[#111111] px-4 py-1.5">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#A3A3A3]">
          <span>Vol. IV &nbsp;|&nbsp; July 24, 2026</span>
          <span>Dhaka Edition</span>
          <span className="hidden sm:inline">All the Listings That&apos;re Fit to Rent</span>
        </div>
      </div>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-40 border-b border-[#111111] bg-[#F9F9F7]">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#111111]">
              <Newspaper className="h-5 w-5 text-[#111111]" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-xl font-black uppercase tracking-tight text-[#111111]">
              ToLet Mama
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {["Features", "How It Works", "Testimonials"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                className="font-sans text-xs font-medium uppercase tracking-widest text-[#111111] transition-colors hover:text-[#CC0000]"
              >
                {l}
              </a>
            ))}
            <div className="flex items-center gap-3">
              <Link
                to="/auth"
                className="border border-[#111111] px-4 py-3 font-sans text-xs font-semibold uppercase tracking-widest text-[#111111] transition-all hover:bg-[#111111] hover:text-[#F9F9F7] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-[#111111] px-4 py-3 font-sans text-xs font-semibold uppercase tracking-widest text-[#F9F9F7] transition-all hover:bg-[#F9F9F7] hover:text-[#111111] hover:outline hover:outline-1 hover:outline-[#111111] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="border-b-4 border-[#111111]">
        <div className="mx-auto grid max-w-screen-xl lg:grid-cols-12">
          {/* Main headline */}
          <div className="flex flex-col justify-center border-b border-[#111111] px-6 py-12 lg:col-span-8 lg:border-b-0 lg:border-r lg:py-20">
            <div className="mb-6 inline-flex items-center gap-2 border border-[#CC0000] px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-widest text-[#CC0000]">
              <span className="inline-block h-1.5 w-1.5 bg-[#CC0000]" />
              Breaking: 15,000+ Tenants Served
            </div>
            <h1 className="mb-8 font-serif text-5xl font-black leading-[0.9] tracking-tighter text-[#111111] sm:text-6xl lg:text-8xl">
              FIND YOUR
              <br />
              PERFECT HOME
              <br />
              <span className="italic text-[#CC0000]">in Dhaka</span>
            </h1>
            <p className="mb-8 max-w-lg font-body text-base leading-relaxed text-justify text-[#525252] first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:font-black first-letter:leading-none first-letter:text-[#111111] md:first-letter:text-7xl">
              The smartest way for students to find rooms and for house owners to find tenants.
              Verified listings, real-time updates, and a community you can trust since 2022.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-[#111111] px-7 py-3.5 font-sans text-sm font-semibold uppercase tracking-widest text-[#F9F9F7] transition-all hover:bg-[#F9F9F7] hover:text-[#111111] hover:outline hover:outline-1 hover:outline-[#111111] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                Get Started
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-[#111111] px-7 py-3.5 font-sans text-sm font-semibold uppercase tracking-widest text-[#111111] transition-all hover:bg-[#111111] hover:text-[#F9F9F7] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                How It Works
              </a>
            </div>
            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[#111111] pt-8">
              {[
                { value: "2,547", label: "Active Listings" },
                { value: "15,280", label: "Happy Tenants" },
                { value: "4.9", label: "Avg. Rating" },
              ].map((s) => (
                <div key={s.label} className="border-r border-[#111111] pr-4 last:border-r-0">
                  <p className="font-mono text-2xl font-bold text-[#111111]">{s.value}</p>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#737373]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative lg:col-span-4">
            <img
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop"
              alt="Fig. 1.1 — Dhaka city skyline at dusk, showing the dense urban landscape"                className="h-full w-full object-cover grayscale transition-all hover:sepia-[50%]"
            />
            <div className="absolute bottom-0 left-0 right-0 border-t border-[#111111] bg-[#F9F9F7] px-3 py-1.5">
              <p className="font-sans text-[10px] uppercase tracking-widest text-[#737373]">
                Fig. 1.1 — Dhaka Skyline
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="newsprint-texture py-16 lg:py-20">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="mb-12 border-b border-[#111111] pb-6">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-[#CC0000]">
              Why ToLet Mama
            </p>
            <h2 className="font-serif text-4xl font-black tracking-tight lg:text-5xl">
              Everything you need,
              <br />
              all in one place.
            </h2>
          </div>
          <div className="grid grid-cols-1 border-l border-t border-[#111111] sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group border-b border-r border-[#111111] p-6 transition-colors hover:bg-[#111111]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center border border-[#111111] transition-all group-hover:border-[#F9F9F7]">
                  <f.icon
                    className="h-6 w-6 text-[#111111] transition-all group-hover:text-[#F9F9F7]"
                    strokeWidth={1}
                  />
                </div>
                <h3 className="mb-2 font-serif text-xl font-bold text-[#111111] transition-colors group-hover:text-[#F9F9F7]">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#525252] transition-colors group-hover:text-[#A3A3A3]">
                  {f.desc}
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3] transition-colors group-hover:text-[#737373]">
                  Fig. 2.{i + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works (Inverted Section) ─── */}
      <section id="how-it-works" className="bg-[#111111] py-16 text-[#F9F9F7] lg:py-20">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="mb-12 border-b border-[#404040] pb-6">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-[#CC0000]">
              Simple Process
            </p>
            <h2 className="font-serif text-4xl font-black tracking-tight lg:text-5xl">
              How it works.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-0 border-l border-t border-[#404040] md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Create Account",
                desc: "Sign up as a Student or House Owner. It takes less than 2 minutes.",
              },
              {
                num: "02",
                title: "Browse or List",
                desc: "Search thousands of verified rooms or list your property with photos and details.",
              },
              {
                num: "03",
                title: "Connect & Move In",
                desc: "Chat directly, schedule visits, and finalize your rental — all through the platform.",
              },
            ].map((item, i) => (
              <div
                key={item.num}
                className="border-b border-r border-[#404040] p-8 transition-colors hover:bg-[#1a1a1a]"
              >
                <p className="mb-4 font-mono text-7xl font-bold text-[#CC0000]">{item.num}</p>
                <h3 className="mb-3 font-serif text-2xl font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#A3A3A3]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Ornamental Divider ─── */}
      <div className="select-none border-b border-[#111111] py-6 text-center font-serif text-xl tracking-[1em] text-[#A3A3A3]">
        &#x2727; &#x2727; &#x2727;
      </div>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-16 lg:py-20">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="mb-12 border-b border-[#111111] pb-6">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-[#CC0000]">
              Testimonials
            </p>
            <h2 className="font-serif text-4xl font-black tracking-tight lg:text-5xl">
              Loved by students
              <br />
              and owners alike.
            </h2>
          </div>
          <div className="grid grid-cols-1 border-l border-t border-[#111111] md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col border-b border-r border-[#111111] p-6 transition-colors hover:bg-[#111111] group"
              >
                <p className="mb-4 font-serif text-4xl font-black leading-none text-[#111111] transition-colors group-hover:text-[#F9F9F7]">
                  &ldquo;
                </p>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-[#525252] transition-colors group-hover:text-[#A3A3A3]">
                  {t.text}
                </p>
                <div className="flex items-center gap-3 border-t border-[#111111] pt-4 transition-colors group-hover:border-[#404040]">
                  <div className="flex h-9 w-9 items-center justify-center border border-[#111111] font-sans text-xs font-bold text-[#111111] transition-all group-hover:border-[#F9F9F7] group-hover:text-[#F9F9F7]">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#111111] transition-colors group-hover:text-[#F9F9F7]">
                      {t.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#737373] transition-colors group-hover:text-[#A3A3A3]">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA (Inverted) ─── */}
      <section className="border-t-4 border-[#111111] bg-[#111111] py-16 lg:py-20">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-[#CC0000]">
                Final Edition
              </p>
              <h2 className="font-serif text-4xl font-black leading-tight tracking-tight text-[#F9F9F7] lg:text-5xl">
                Ready to find your perfect home?
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-[#A3A3A3]">
                Join thousands of students and house owners already using ToLet Mama across Dhaka.
              </p>
            </div>
            <div className="flex gap-4 lg:col-span-4 lg:justify-end">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 border border-[#F9F9F7] bg-[#F9F9F7] px-7 py-3.5 font-sans text-sm font-semibold uppercase tracking-widest text-[#111111] transition-all hover:bg-[#111111] hover:text-[#F9F9F7] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t-4 border-[#111111] bg-[#F9F9F7]">
        <div className="mx-auto max-w-screen-xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 border-l border-t border-[#111111] md:grid-cols-12">
            <div className="border-b border-r border-[#111111] p-6 md:col-span-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center border border-[#111111]">
                  <Newspaper className="h-4 w-4 text-[#111111]" strokeWidth={1.5} />
                </div>
                <span className="font-serif text-lg font-black uppercase tracking-tight text-[#111111]">
                  ToLet Mama
                </span>
              </div>
              <p className="font-body text-xs leading-relaxed text-[#525252]">
                The Dhaka Rental Authority. Connecting students and house owners since 2022.
                Verified listings. Real people. No nonsense.
              </p>
            </div>
            {[
              { title: "Pages", links: ["Home", "Sign In", "Subscribe", "Dashboard"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Accessibility"] },
              { title: "Contact", links: ["hello@toletmama.com", "Dhaka, Bangladesh", "Press Inquiries"] },
            ].map((col) => (
              <div key={col.title} className="border-b border-r border-[#111111] p-6 md:col-span-2 last:border-r">
                <p className="mb-4 font-sans text-[10px] font-semibold uppercase tracking-widest text-[#737373]">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="font-sans text-xs text-[#525252] decoration-2 underline-offset-4 transition-all hover:text-[#111111] hover:underline hover:decoration-[#CC0000]"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#111111] pt-6 md:flex-row">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
              &copy; 2026 ToLet Mama. All rights reserved. Printed in Dhaka.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3]">
              Edition: Vol. IV &nbsp;|&nbsp; Printed in Dhaka
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
