import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { registerUser } from "../lib/api";
import { signInWithSocialProvider } from "../lib/firebaseAuth";

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
    if (password.length < 6) return { level: "weak", label: "Too short", color: "bg-[#A89880]", width: "w-1/4" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: "weak", label: "Weak", color: "bg-[#A89880]", width: "w-1/4" };
    if (score <= 4) return { level: "medium", label: "Medium", color: "bg-[#5C3A21]", width: "w-2/4" };
    return { level: "strong", label: "Strong", color: "bg-[#2C1810]", width: "w-full" };
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
      await registerUser({ name, email, password });
      setSubmitMessage({ type: "success", text: "Account created! Redirecting to your dashboard..." });
      setTimeout(() => navigate("/dashboard", { state: { role } }), 800);
    } catch {
      setSubmitMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignUp = async (providerName) => {
    setSubmitMessage(null);
    setIsSubmitting(true);
    try {
      const user = await signInWithSocialProvider(providerName, role);
      const firstName = user.displayName?.split(" ")[0] || role;
      setSubmitMessage({ type: "success", text: `Account ready, ${firstName}! Redirecting to your dashboard...` });
      setTimeout(() => navigate("/dashboard", { state: { role } }), 800);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error.message || "Social sign up failed. Please try again.",
      });
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
    `w-full border-b-2 bg-transparent py-3 pl-7 font-serif text-sm text-[#2C1810] placeholder-[#A89880] outline-none transition-colors ${
      errors[field] ? "border-[#2C1810]" : "border-[#5C3A21]/30 focus:border-[#2C1810]"
    }`;

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen items-center justify-center bg-[#FAF3E0] text-[#2C1810] px-4 py-12"
    >
      {/* ─── Sign Up Form ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white border-2 border-[#5C3A21]/20 p-8 lg:p-10"
      >
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="font-serif text-xl font-black uppercase tracking-tight text-[#2C1810]">
              The Daily Gazette
            </span>
          </div>

          <div className="mb-8 border-b-2 border-[#2C1810] pb-6">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[#2C1810]">
              Create your account.
            </h2>
            <p className="mt-2 font-serif text-sm text-[#5C3A21]">
              Sign up as a {role.toLowerCase()} — it takes less than 2 minutes.
            </p>
          </div>

          {/* Role Toggle */}
          <div className="mb-8 grid grid-cols-2 border-2 border-[#2C1810]">
            {[ROLES.STUDENT, ROLES.OWNER].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`px-4 py-3 font-serif text-xs font-bold uppercase tracking-[0.15em] transition-all ${
                  role === r
                    ? "bg-[#2C1810] text-[#FAF3E0]"
                    : "bg-transparent text-[#5C3A21] hover:bg-[#F4E8C1]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Form */}
          <motion.form
            variants={formVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit} noValidate className="space-y-5"
          >
            <motion.div variants={itemVariants}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.name ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
                <input id="name" type="text" placeholder="Rafsan Islam" value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }}
                  className={inputClass("name")} />
              </div>
              {errors.name && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.name}</p>}
            </div>
            </motion.div>

            <motion.div variants={itemVariants}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.email ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
                <input id="email" type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
                  className={inputClass("email")} />
              </div>
              {errors.email && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.email}</p>}
            </div>
            </motion.div>

            <motion.div variants={itemVariants}>
            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.password ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
                <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
                  className={`${inputClass("password")} pr-10`} />
                <button type="button" onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A89880] hover:text-[#2C1810]" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.password}</p>}
              {password && !errors.password && strength && (
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.15em] text-[#A89880]">Password strength</span>
                    <span className={`font-serif text-xs font-bold uppercase tracking-[0.1em] ${
                      strength.level === "weak" ? "text-[#A89880]" : "text-[#2C1810]"
                    }`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex h-1.5 w-full border border-[#5C3A21]/30 bg-[#FAF3E0]">
                    <div className={`h-full transition-all duration-500 ${strength.width} ${strength.color}`} />
                  </div>
                </div>
              )}
            </div>
            </motion.div>

            <motion.div variants={itemVariants}>
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.confirmPassword ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
                <input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                  className={`${inputClass("confirmPassword")} pr-10`} />
                <button type="button" onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A89880] hover:text-[#2C1810]" tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.confirmPassword}</p>}
            </div>
            </motion.div>

            <motion.div variants={itemVariants}>
            {/* Terms */}
            <div>
              <label className={`flex cursor-pointer items-start gap-3 border-2 p-4 transition-colors ${
                errors.agreed ? "border-[#2C1810] bg-[#FAF3E0]" : "border-[#5C3A21]/20 hover:bg-[#FAF3E0]"
              }`}>
                <input type="checkbox" checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((p) => ({ ...p, agreed: "" })); }}
                  className="mt-0.5 accent-[#2C1810]" />
                <span className="font-serif text-xs leading-relaxed text-[#5C3A21]">
                  I agree to the{" "}
                  <a href="#" className="font-bold text-[#2C1810] underline underline-offset-4 decoration-[#5C3A21]/40 hover:decoration-[#2C1810]" onClick={(e) => e.preventDefault()}>
                    Terms of Service
                  </a>{" "}and{" "}
                  <a href="#" className="font-bold text-[#2C1810] underline underline-offset-4 decoration-[#5C3A21]/40 hover:decoration-[#2C1810]" onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreed && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.agreed}</p>}
            </div>
            </motion.div>

            <motion.div variants={itemVariants}>
            {/* Submit */}
            <motion.button type="submit" disabled={isSubmitting}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-rubber-stamp w-full justify-center py-3 text-sm disabled:opacity-50">
              {isSubmitting ? "Creating account..." : `Create ${role} Account`}
            </motion.button>
            </motion.div>

            <motion.div variants={itemVariants}>
            <AnimatePresence>
              {submitMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className={`border-2 px-4 py-3 text-center font-serif text-sm font-bold overflow-hidden ${
                    submitMessage.type === "success"
                      ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                      : "border-[#2C1810] bg-[#FAF3E0] text-[#2C1810]"
                  }`}
                >
                  {submitMessage.text}
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants}>
            {/* Divider */}
            <div className="relative flex items-center gap-4">
              <div className="h-px flex-1 bg-[#5C3A21]/20" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#A89880]">or</span>
              <div className="h-px flex-1 bg-[#5C3A21]/20" />
            </div>

            </motion.div>

            <motion.div variants={itemVariants}>
            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button type="button" disabled={isSubmitting} onClick={() => handleSocialSignUp("google")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-coupon-clip w-full justify-center py-2.5 text-xs disabled:opacity-50">
                Google
              </motion.button>
              <motion.button type="button" disabled={isSubmitting} onClick={() => handleSocialSignUp("facebook")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-coupon-clip w-full justify-center py-2.5 text-xs disabled:opacity-50">
                Facebook
              </motion.button>
            </div>
            </motion.div>

            <motion.div variants={itemVariants}>
            {/* Sign in link */}
            <p className="text-center font-serif text-sm text-[#5C3A21]">
              Already have an account?{" "}
              <Link to="/auth" className="font-bold text-[#2C1810] underline underline-offset-4 decoration-[#5C3A21]/40 hover:decoration-[#2C1810] transition-all">
                Sign in
              </Link>
            </p>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SignUpPage;
