import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  LockKeyhole,
  Building2,
  ArrowRight,
} from "lucide-react";
import { loginUser, loginWithGoogle } from "../lib/api";
import { initGoogleSignIn } from "../lib/googleAuth";

const ROLES = {
  STUDENT: "Student",
  OWNER: "Owner",
};

function AuthPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(ROLES.STUDENT);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const googleBtnRef = useRef(null);
  const heroRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const formSectionRef = useRef(null);
  const featuresRef = useRef(null);

  // Scroll progress + native scroll-driven reveals (no animation libs)
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Reveal elements as they enter the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    const targets = [
      formSectionRef.current,
      ...Array.from(document.querySelectorAll(".feature-card")),
    ].filter(Boolean);

    targets.forEach((el) => {
      el.classList.add("reveal-on-scroll");
      io.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      io.disconnect();
    };
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await loginUser({ email, password, role: role.toLowerCase() });
      setSubmitMessage({
        type: "success",
        text: `Welcome back, ${role}! Redirecting to your dashboard...`,
      });
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setSubmitMessage({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (error, user) => {
    setSubmitMessage(null);
    if (error) {
      setSubmitMessage({ type: "error", text: error.message });
      return;
    }
    if (user) {
      try {
        setIsSubmitting(true);
        await loginWithGoogle(user.credential, role.toLowerCase());
        const firstName = user.name?.split(" ")[0] || role;
        setSubmitMessage({
          type: "success",
          text: `Welcome back, ${firstName}! Redirecting to your dashboard...`,
        });
        setTimeout(() => navigate("/dashboard"), 800);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          (err.request
            ? "The backend is not running. Start Docker and run `docker compose up --build`, then try Google sign-in again."
            : "Google sign-in failed. Please try again.");
        setSubmitMessage({ type: "error", text: msg });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (googleBtnRef.current) {
      googleBtnRef.current.innerHTML = "";
    }
    initGoogleSignIn("google-signin-btn", handleGoogleSignIn, role);
  }, [role]);

  const switchRole = (newRole) => {
    setRole(newRole);
    setErrors({});
    setSubmitMessage(null);
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={scrollContainerRef}
      className="relative min-h-screen overflow-x-hidden font-sans"
      style={{ background: "var(--theme-bg)", color: "var(--theme-ink)" }}
    >
      {/* Top Fixed Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1" style={{ background: "var(--theme-border)" }}>
        <div
          className="h-full transition-all duration-150"
          style={{ background: "var(--theme-ink)", width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Glass Navigation Header */}
      <header className="relative z-20 px-4 py-3 sm:px-8">
        <div className="glass-pane mx-auto flex max-w-screen-xl items-center justify-between rounded-full px-6 py-3">
          <Link
            to="/"
            className="group inline-flex items-center gap-2.5 font-serif text-xs font-bold uppercase tracking-[0.15em]"
            style={{ color: "var(--theme-ink-muted)" }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-[var(--theme-ink)] group-hover:text-[var(--theme-bg)]"
              style={{ border: "1px solid var(--theme-ink)", color: "var(--theme-ink)" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span>Return</span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <span className="font-serif text-xs font-bold uppercase tracking-widest" style={{ color: "var(--theme-ink-muted)" }}>
              Dhaka Rental Authority
            </span>
            <span style={{ color: "var(--theme-ink-faded)" }}>•</span>
            <span
              className="rounded-full px-2.5 py-0.5 font-serif text-[10px] font-black uppercase tracking-wider"
              style={{ border: "1px solid var(--theme-ink)", color: "var(--theme-ink)", background: "var(--theme-surface-2)" }}
            >
              EST. 2026
            </span>
          </div>

          <Link
            to="/signup"
            className="rounded-full px-4 py-2 font-serif text-xs font-bold uppercase tracking-[0.12em]"
            style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
          >
            New Account
          </Link>
        </div>
      </header>

      {/* ── SECTION 1: Hero Banner & Scroll Trigger Prompt ── */}
      <section
        ref={heroRef}
        className="relative z-10 mx-auto flex min-h-[65vh] max-w-screen-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-pane mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-serif text-[11px] font-bold uppercase tracking-[0.25em]"
          style={{ color: "var(--theme-ink-muted)" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Scroll Access</span>
        </motion.div>

        <h1
          className="font-serif text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl max-w-4xl"
        >
          Scroll to Discover Your<br />
          <span className="italic font-medium" style={{ color: "var(--theme-ink-muted)" }}>Dhaka Sanctuary.</span>
        </h1>

        <p
          className="mt-6 max-w-2xl font-serif text-base sm:text-lg leading-relaxed"
          style={{ color: "var(--theme-ink-muted)" }}
        >
          Welcome to the premier portal for verified student rooms, bachelor pads,
          and landlord listings across Gulshan, Banani, Dhanmondi & beyond.
        </p>

        {/* Action Button & Scroll Indicator */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={scrollToForm}
            className="group flex items-center gap-3 rounded-full px-8 py-4 font-serif text-xs font-bold uppercase tracking-[0.15em] transition-all"
            style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
          >
            <span>Access Auth Terminal</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </button>

          <div
            className="mt-8 flex items-center gap-2 font-serif text-xs font-bold uppercase tracking-[0.2em] animate-bounce"
            style={{ color: "var(--theme-ink-faded)" }}
          >
            <span>Scroll Down to Discover</span>
            <ChevronDown className="h-4 w-4" style={{ color: "var(--theme-ink-muted)" }} />
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Interactive Role Switcher Spotlight ── */}
      <section className="relative z-10 py-12 px-4 sm:px-8">
        <div className="glass-pane mx-auto max-w-screen-xl rounded-3xl px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-wider" style={{ color: "var(--theme-ink)" }}>
              1. Select Your Rental Role
            </h2>
            <p className="mt-2 font-serif text-xs sm:text-sm tracking-wide" style={{ color: "var(--theme-ink-muted)" }}>
              Switching roles customizes your authentication pipeline instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Student Persona Option */}
            <button
              type="button"
              onClick={() => switchRole(ROLES.STUDENT)}
              className={`group relative rounded-2xl p-6 text-left transition-all duration-300 ${
                role === ROLES.STUDENT
                  ? "ring-2"
                  : ""
              }`}
              style={
                role === ROLES.STUDENT
                  ? { background: "var(--theme-ink)", color: "var(--theme-bg)", boxShadow: "0 8px 30px -6px rgba(0,0,0,0.4)" }
                  : { background: "var(--theme-surface)", color: "var(--theme-ink)", border: "1px solid var(--theme-border-strong)" }
              }
            >
              <div className="flex items-center justify-between">
                <div
                  className="rounded-full p-3"
                  style={
                    role === ROLES.STUDENT
                      ? { background: "var(--theme-bg)", color: "var(--theme-ink)" }
                      : { background: "var(--theme-surface-2)", color: "var(--theme-ink)" }
                  }
                >
                  <GraduationCap className="h-6 w-6" strokeWidth={2} />
                </div>
                {role === ROLES.STUDENT && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: "var(--theme-bg)", color: "var(--theme-ink)" }}
                  >
                    Active
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold tracking-tight">
                Student Tenant
              </h3>
              <p
                className="mt-1.5 font-serif text-xs leading-relaxed"
                style={{ color: role === ROLES.STUDENT ? "rgba(247,239,227,0.7)" : "var(--theme-ink-muted)" }}
              >
                Instant 1-click login with university Google (.edu) credentials.
              </p>
            </button>

            {/* Owner Persona Option */}
            <button
              type="button"
              onClick={() => switchRole(ROLES.OWNER)}
              className={`group relative rounded-2xl p-6 text-left transition-all duration-300 ${
                role === ROLES.OWNER
                  ? "ring-2"
                  : ""
              }`}
              style={
                role === ROLES.OWNER
                  ? { background: "var(--theme-ink)", color: "var(--theme-bg)", boxShadow: "0 8px 30px -6px rgba(0,0,0,0.4)" }
                  : { background: "var(--theme-surface)", color: "var(--theme-ink)", border: "1px solid var(--theme-border-strong)" }
              }
            >
              <div className="flex items-center justify-between">
                <div
                  className="rounded-full p-3"
                  style={
                    role === ROLES.OWNER
                      ? { background: "var(--theme-bg)", color: "var(--theme-ink)" }
                      : { background: "var(--theme-surface-2)", color: "var(--theme-ink)" }
                  }
                >
                  <Building2 className="h-6 w-6" strokeWidth={2} />
                </div>
                {role === ROLES.OWNER && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: "var(--theme-bg)", color: "var(--theme-ink)" }}
                  >
                    Active
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold tracking-tight">
                Property Owner
              </h3>
              <p
                className="mt-1.5 font-serif text-xs leading-relaxed"
                style={{ color: role === ROLES.OWNER ? "rgba(247,239,227,0.7)" : "var(--theme-ink-muted)" }}
              >
                Access property management, listings dashboard, & inquiry manager.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Modern Auth Terminal Card ── */}
      <section
        ref={formSectionRef}
        className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="glass-pane-strong rounded-3xl p-6 sm:p-10">
          {/* Header */}
          <div className="mb-8 border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: "var(--theme-border)" }}>
            <div>
              <div className="inline-flex items-center gap-2 font-serif text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>
                <LockKeyhole className="h-4 w-4" />
                <span>Authentication Terminal</span>
              </div>
              <h2 className="mt-1 font-serif text-3xl font-black tracking-tight" style={{ color: "var(--theme-ink)" }}>
                Sign In as {role}
              </h2>
            </div>
            <div
              className="rounded-full px-3 py-1.5 text-center sm:text-right"
              style={{ border: "1px solid var(--theme-border-strong)" }}
            >
              <span className="block font-serif text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--theme-ink-muted)" }}>
                Status
              </span>
              <span className="font-serif text-xs font-black uppercase" style={{ color: "var(--theme-ink)" }}>
                Ready for Auth
              </span>
            </div>
          </div>

          {/* Feedback Message Banner */}
          <AnimatePresence>
            {submitMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={`rounded-2xl p-4 text-center font-serif text-sm font-bold overflow-hidden mb-6 ${
                  submitMessage.type === "success"
                    ? ""
                    : ""
                }`}
                style={
                  submitMessage.type === "success"
                    ? { background: "var(--theme-ink)", color: "var(--theme-bg)" }
                    : { background: "var(--theme-surface-2)", color: "var(--theme-ink)", border: "1px solid var(--theme-border-strong)" }
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{submitMessage.text}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Owner Form: Email + Password ── */}
          {role === ROLES.OWNER && (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-serif text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: "var(--theme-ink-muted)" }}
                >
                  Landlord / Owner Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: errors.email ? "var(--theme-ink)" : "var(--theme-ink-faded)" }}
                    strokeWidth={2}
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="owner@toletmama.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                    }}
                    className="w-full rounded-2xl py-3.5 pl-11 pr-4 font-serif text-sm outline-none transition-all"
                    style={{
                      background: "var(--theme-surface)",
                      color: "var(--theme-ink)",
                      border: errors.email ? "2px solid var(--theme-ink)" : "1px solid var(--theme-border-strong)",
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 font-serif text-xs font-bold" style={{ color: "var(--theme-ink)" }}>
                    ⚠ {errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block font-serif text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: "var(--theme-ink-muted)" }}
                  >
                    Account Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-serif text-xs font-bold uppercase tracking-wider underline underline-offset-4 transition-all"
                    style={{ color: "var(--theme-ink-muted)", textDecorationColor: "var(--theme-border-strong)" }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: errors.password ? "var(--theme-ink)" : "var(--theme-ink-faded)" }}
                    strokeWidth={2}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                    }}
                    className="w-full rounded-2xl py-3.5 pl-11 pr-11 font-serif text-sm outline-none transition-all"
                    style={{
                      background: "var(--theme-surface)",
                      color: "var(--theme-ink)",
                      border: errors.password ? "2px solid var(--theme-ink)" : "1px solid var(--theme-border-strong)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                    style={{ color: "var(--theme-ink-faded)" }}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 font-serif text-xs font-bold" style={{ color: "var(--theme-ink)" }}>
                    ⚠ {errors.password}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full justify-center rounded-full py-3.5 font-serif text-xs font-bold uppercase tracking-[0.15em] disabled:opacity-50 cursor-pointer"
                style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
              >
                {isSubmitting ? "Verifying Credentials..." : `Sign In as Owner`}
              </motion.button>
              <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "var(--theme-border)" }} /></div>
                <span className="relative px-3 font-serif text-xs uppercase tracking-[0.15em]" style={{ background: "var(--theme-surface-2)", color: "var(--theme-ink-muted)" }}>or continue with Google (any Gmail)</span>
              </div>
              <div className="flex justify-center">
                <div id="google-signin-btn" ref={googleBtnRef} className="min-h-[44px] min-w-[240px] flex justify-center" />
              </div>
            </form>
          )}

          {/* ── Student Form: Institutional Google SSO ── */}
          {role === ROLES.STUDENT && (
            <div className="space-y-6">
              <div className="glass-pane rounded-2xl p-5 text-center">
                <div
                  className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-serif text-sm font-bold uppercase tracking-wider" style={{ color: "var(--theme-ink)" }}>
                  Verified Institutional SSO
                </h4>
                <p className="mt-1 font-serif text-xs leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>
                  Sign in using your university email address (.edu / .edu.bd) for
                  instant access to verified student bachelor rooms.
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <div
                  id="google-signin-btn"
                  ref={googleBtnRef}
                  className="min-h-[44px] min-w-[240px] flex justify-center"
                />
              </div>
              <p className="text-center font-serif text-xs" style={{ color: "var(--theme-ink-faded)" }}>Owner can use any Gmail — select Owner tab above</p>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-10 border-t pt-6 text-center" style={{ borderColor: "var(--theme-border)" }}>
            <p className="font-serif text-sm" style={{ color: "var(--theme-ink-muted)" }}>
              Do not have an account registered yet?{" "}
              <Link
                to="/signup"
                className="font-bold underline underline-offset-4 transition-all"
                style={{ color: "var(--theme-ink)" }}
              >
                Create new account
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Scroll Feature Cards Strip ── */}
      <section
        ref={featuresRef}
        className="relative z-10 py-16 px-4 sm:px-8"
      >
        <div className="glass-pane mx-auto max-w-screen-xl rounded-3xl px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-wider" style={{ color: "var(--theme-ink)" }}>
              Why Renters & Landlords Trust To-Let Mama
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "100% Verified Properties", desc: "Every listed room and apartment undergo physical or institutional verification before publishing." },
              { icon: Building, title: "Dhaka-Wide Coverage", desc: "Explore handpicked accommodations across Gulshan, Banani, Dhanmondi, Mirpur, Uttara, & Baridhara." },
              { icon: GraduationCap, title: "Student & Bachelor Friendly", desc: "Tailored filtering for university proximity, budget limits, meal facilities, and wifi support." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="feature-card rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={{ background: "color-mix(in srgb, var(--theme-surface) 60%, transparent)" }}
              >
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
                >
                  <feature.icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="font-serif text-xl font-bold" style={{ color: "var(--theme-ink)" }}>
                  {feature.title}
                </h3>
                <p className="mt-2 font-serif text-xs leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t py-8 text-center font-serif text-xs" style={{ borderColor: "var(--theme-border)" }}>
        <p className="uppercase tracking-[0.2em] font-bold" style={{ color: "var(--theme-ink)" }}>
          © 2026 TO-LET MAMA • THE DHAKA RENTAL AUTHORITY
        </p>
        <p className="mt-1 text-[11px]" style={{ color: "var(--theme-ink-faded)" }}>
          All Rights Reserved. Verified Student & Landlord Accommodation Network.
        </p>
      </footer>
    </div>
  );
}

export default AuthPage;
