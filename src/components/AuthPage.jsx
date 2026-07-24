import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Newspaper, Mail, Lock, Eye, EyeOff } from "lucide-react";

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

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
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
      await new Promise((resolve, reject) =>
        setTimeout(() => (Math.random() > 0.15 ? resolve() : reject(new Error("Network error"))), 1200)
      );
      setSubmitMessage({ type: "success", text: `Welcome back, ${role}! Redirecting to your dashboard...` });
      setTimeout(() => navigate("/dashboard", { state: { role } }), 800);
    } catch {
      setSubmitMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setErrors({});
    setSubmitMessage(null);
  };

  return (
    <div className="flex min-h-screen sharp-corners bg-[#F9F9F7]">
      {/* ─── Left Panel ─── */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="https://images.unsplash.com/photo-1569250607163?q=80&w=1200&auto=format&fit=crop"
          alt="Dhaka city skyline"
          className="h-full w-full object-cover grayscale transition-all hover:sepia-[50%]"
        />
        <div className="absolute inset-0 bg-[#111111]/70" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#F9F9F7]">
              <Newspaper className="h-5 w-5 text-[#F9F9F7]" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-2xl font-black uppercase tracking-tight text-[#F9F9F7]">
              ToLet Mama
            </span>
          </div>
          <div className="max-w-md">
            <h1 className="mb-4 font-serif text-5xl font-black leading-[0.95] tracking-tighter text-[#F9F9F7]">
              Find Your Perfect{" "}
              <span className="italic text-[#CC0000]">Home</span>{" "}
              in Dhaka
            </h1>
            <p className="font-body leading-relaxed text-[#A3A3A3]">
              Whether you&apos;re a student looking for a cozy room or a house owner
              ready to list your property — we&apos;ve got you covered.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { value: "2,547", label: "Active Listings" },
              { value: "15,280", label: "Happy Tenants" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className="border border-[#F9F9F7]/20 px-5 py-3">
                <p className="font-mono text-2xl font-bold text-[#F9F9F7]">{stat.value}</p>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#A3A3A3]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Auth Form ─── */}
      <div className="flex w-full items-center justify-center border-l border-[#111111] px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center border border-[#111111]">
              <Newspaper className="h-5 w-5 text-[#111111]" strokeWidth={1.5} />
            </div>
            <span className="font-serif text-2xl font-black uppercase tracking-tight text-[#111111]">
              ToLet Mama
            </span>
          </div>

          <div className="mb-8 border-b border-[#111111] pb-6">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[#111111]">
              Welcome back.
            </h2>
            <p className="mt-2 font-sans text-sm text-[#737373]">
              Sign in to your {role.toLowerCase()} account to continue.
            </p>
          </div>

          {/* ─── Role Toggle ─── */}
          <div className="mb-8 flex border border-[#111111]">
            {[ROLES.STUDENT, ROLES.OWNER].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`flex-1 px-4 py-3 font-sans text-xs font-semibold uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 ${
                  role === r
                    ? "bg-[#111111] text-[#F9F9F7]"
                    : "bg-transparent text-[#111111] hover:bg-[#E5E5E0]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* ─── Form ─── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-widest text-[#111111]">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.email ? "text-[#CC0000]" : "text-[#A3A3A3]"}`} strokeWidth={1.5} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
                  className={`w-full border-b-2 bg-transparent py-3 pl-7 font-mono text-sm text-[#111111] placeholder-[#A3A3A3] outline-none transition-colors focus-visible:bg-[#F0F0F0] ${
                    errors.email ? "border-[#CC0000]" : "border-[#111111]"
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1.5 font-sans text-xs text-[#CC0000]">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-widest text-[#111111]">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.password ? "text-[#CC0000]" : "text-[#A3A3A3]"}`} strokeWidth={1.5} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
                  className={`w-full border-b-2 bg-transparent py-3 pl-7 pr-10 font-mono text-sm text-[#111111] placeholder-[#A3A3A3] outline-none transition-colors focus-visible:bg-[#F0F0F0] ${
                    errors.password ? "border-[#CC0000]" : "border-[#111111]"
                  }`}
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A3A3A3] transition-colors hover:text-[#111111]" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 font-sans text-xs text-[#CC0000]">{errors.password}</p>}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="font-sans text-xs font-medium text-[#111111] decoration-2 underline-offset-4 transition-all hover:text-[#CC0000] hover:underline hover:decoration-[#CC0000]">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center bg-[#111111] py-3 font-sans text-sm font-semibold uppercase tracking-widest text-[#F9F9F7] transition-all hover:bg-[#F9F9F7] hover:text-[#111111] hover:outline hover:outline-1 hover:outline-[#111111] disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
            >
              {isSubmitting ? "Signing in..." : `Sign in as ${role}`}
            </button>

            {/* Message */}
            {submitMessage && (
              <div className={`border px-4 py-3 text-center font-sans text-sm font-medium ${
                submitMessage.type === "success"
                  ? "border-[#111111] bg-[#111111] text-[#F9F9F7]"
                  : "border-[#CC0000] text-[#CC0000]"
              }`}>
                {submitMessage.text}
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center gap-4">
              <div className="h-px flex-1 bg-[#111111]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3]">or</span>
              <div className="h-px flex-1 bg-[#111111]" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 border border-[#111111] py-2.5 font-sans text-xs font-medium uppercase tracking-wider text-[#111111] transition-all hover:bg-[#111111] hover:text-[#F9F9F7] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 border border-[#111111] py-2.5 font-sans text-xs font-medium uppercase tracking-wider text-[#111111] transition-all hover:bg-[#111111] hover:text-[#F9F9F7] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">
                Facebook
              </button>
            </div>

            {/* Sign up link */}
            <p className="text-center font-sans text-sm text-[#737373]">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-semibold text-[#111111] decoration-2 underline-offset-4 hover:text-[#CC0000] hover:underline hover:decoration-[#CC0000]">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
