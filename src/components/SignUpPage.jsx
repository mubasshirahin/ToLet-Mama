import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Newspaper, User, Mail, Lock, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";

const ROLES = {
  STUDENT: "Student",
  OWNER: "Owner",
};

function SignUpPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(ROLES.STUDENT);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { level: "weak", label: "Too short", color: "bg-[#CC0000]", width: "w-1/4" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: "weak", label: "Weak", color: "bg-[#CC0000]", width: "w-1/4" };
    if (score <= 4) return { level: "medium", label: "Medium", color: "bg-[#111111]", width: "w-2/4" };
    return { level: "strong", label: "Strong", color: "bg-[#111111]", width: "w-full" };
  };

  const strength = getPasswordStrength();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }
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
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!agreed) {
      newErrors.agreed = "You must agree to the Terms & Privacy Policy.";
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
      setSubmitMessage({ type: "success", text: "Account created! Redirecting to your dashboard..." });
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

  const inputClass = (field) =>
    `w-full border-b-2 bg-transparent py-3 pl-7 font-mono text-sm text-[#111111] placeholder-[#A3A3A3] outline-none transition-colors focus-visible:bg-[#F0F0F0] ${
      errors[field] ? "border-[#CC0000]" : "border-[#111111]"
    }`;

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
              Join the{" "}
              <span className="italic text-[#CC0000]">Community</span>
            </h1>
            <p className="font-body leading-relaxed text-[#A3A3A3]">
              Create your free account and start your journey — whether you&apos;re a student
              searching for the perfect room or an owner ready to list your property.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { value: "2 min", label: "Quick Signup" },
              { value: "Free", label: "Forever" },
              { value: "2,547", label: "Listings" },
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

      {/* ─── Right Panel: Form ─── */}
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
              Create your account.
            </h2>
            <p className="mt-2 font-sans text-sm text-[#737373]">
              Sign up as a {role.toLowerCase()} — it takes less than 2 minutes.
            </p>
          </div>

          {/* Role Toggle */}
          <div className="mb-8 flex border border-[#111111]">
            {[ROLES.STUDENT, ROLES.OWNER].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`flex-1 px-4 py-3 font-sans text-xs font-semibold uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 ${
                  role === r ? "bg-[#111111] text-[#F9F9F7]" : "bg-transparent text-[#111111] hover:bg-[#E5E5E0]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-widest text-[#111111]">
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.name ? "text-[#CC0000]" : "text-[#A3A3A3]"}`} strokeWidth={1.5} />
                <input id="name" type="text" placeholder="Rafsan Islam" value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }}
                  className={inputClass("name")} />
              </div>
              {errors.name && <p className="mt-1.5 font-sans text-xs text-[#CC0000]">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-widest text-[#111111]">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.email ? "text-[#CC0000]" : "text-[#A3A3A3]"}`} strokeWidth={1.5} />
                <input id="email" type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
                  className={inputClass("email")} />
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
                <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
                  className={`${inputClass("password")} pr-10`} />
                <button type="button" onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#111111]" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 font-sans text-xs text-[#CC0000]">{errors.password}</p>}
              {/* Strength bar */}
              {password && !errors.password && strength && (
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#A3A3A3]">Password strength</span>
                    <span className={`font-mono text-xs font-bold uppercase tracking-wider ${
                      strength.level === "weak" ? "text-[#CC0000]" : strength.level === "medium" ? "text-[#111111]" : "text-[#111111]"
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex h-1 w-full border border-[#111111]">
                    <div className={`h-full transition-all duration-500 ${strength.width} ${strength.color}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-widest text-[#111111]">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.confirmPassword ? "text-[#CC0000]" : "text-[#A3A3A3]"}`} strokeWidth={1.5} />
                <input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                  className={`${inputClass("confirmPassword")} pr-10`} />
                <button type="button" onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#111111]" tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 font-sans text-xs text-[#CC0000]">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                errors.agreed ? "border-[#CC0000] bg-[#CC0000]/5" : "border-[#111111] hover:bg-[#E5E5E0]"
              }`}>
                <input type="checkbox" checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((p) => ({ ...p, agreed: "" })); }}
                  className="mt-0.5 accent-[#111111]" />
                <span className="font-sans text-xs leading-relaxed text-[#525252]">
                  I agree to the{" "}
                  <a href="#" className="font-semibold text-[#111111] decoration-2 underline-offset-4 hover:text-[#CC0000] hover:underline hover:decoration-[#CC0000]" onClick={(e) => e.preventDefault()}>
                    Terms of Service
                  </a>{" "}and{" "}
                  <a href="#" className="font-semibold text-[#111111] decoration-2 underline-offset-4 hover:text-[#CC0000] hover:underline hover:decoration-[#CC0000]" onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreed && <p className="mt-1.5 font-sans text-xs text-[#CC0000]">{errors.agreed}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting}
              className="flex w-full items-center justify-center bg-[#111111] py-3 font-sans text-sm font-semibold uppercase tracking-widest text-[#F9F9F7] transition-all hover:bg-[#F9F9F7] hover:text-[#111111] hover:outline hover:outline-1 hover:outline-[#111111] disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">
              {isSubmitting ? "Creating account..." : `Create ${role} Account`}
            </button>

            {submitMessage && (
              <div className={`border px-4 py-3 text-center font-sans text-sm font-medium ${
                submitMessage.type === "success" ? "border-[#111111] bg-[#111111] text-[#F9F9F7]" : "border-[#CC0000] text-[#CC0000]"
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

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 border border-[#111111] py-2.5 font-sans text-xs font-medium uppercase tracking-wider text-[#111111] transition-all hover:bg-[#111111] hover:text-[#F9F9F7] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 border border-[#111111] py-2.5 font-sans text-xs font-medium uppercase tracking-wider text-[#111111] transition-all hover:bg-[#111111] hover:text-[#F9F9F7] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">
                Facebook
              </button>
            </div>

            {/* Sign in link */}
            <p className="text-center font-sans text-sm text-[#737373]">
              Already have an account?{" "}
              <Link to="/auth" className="font-semibold text-[#111111] decoration-2 underline-offset-4 hover:text-[#CC0000] hover:underline hover:decoration-[#CC0000]">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
