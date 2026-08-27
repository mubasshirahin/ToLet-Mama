import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { registerUser, loginWithGoogle } from "../lib/api";
import { initGoogleSignIn } from "../lib/googleAuth";

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
  const googleBtnRef = useRef(null);

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 8) return { level: "weak", label: "Too short", color: "var(--theme-ink-faded)", width: "w-1/4" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: "weak", label: "Weak", color: "var(--theme-ink-faded)", width: "w-1/4" };
    if (score <= 4) return { level: "medium", label: "Medium", color: "var(--theme-ink-muted)", width: "w-2/4" };
    return { level: "strong", label: "Strong", color: "var(--theme-ink)", width: "w-full" };
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
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
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
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.password?.[0] || "Something went wrong. Please try again.";
      setSubmitMessage({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async (error, user) => {
    setSubmitMessage(null);
    if (error) {
      setSubmitMessage({ type: "error", text: error.message });
      return;
    }
    if (user) {
      try {
        setIsSubmitting(true);
        await loginWithGoogle(user.credential);
        const firstName = user.name?.split(" ")[0] || role;
        setSubmitMessage({ type: "success", text: `Account ready, ${firstName}! Redirecting to your dashboard...` });
        setTimeout(() => navigate("/dashboard", { state: { role } }), 800);
      } catch (err) {
        const msg = err.response?.data?.message || "Google sign-up failed. Please try again.";
        setSubmitMessage({ type: "error", text: msg });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (role !== ROLES.STUDENT) return;

    if (googleBtnRef.current) {
      googleBtnRef.current.innerHTML = "";
    }
    initGoogleSignIn("google-signup-btn", handleGoogleSignUp, role);
  }, [role]);

  const switchRole = (newRole) => {
    setRole(newRole);
    setErrors({});
    setSubmitMessage(null);
  };

  const inputClass = (field) =>
    `w-full rounded-2xl bg-transparent py-3 pl-7 font-serif text-sm outline-none transition-colors`;
  const inputStyle = (field) => ({
    background: "var(--theme-surface)",
    color: "var(--theme-ink)",
    border: errors[field] ? "2px solid var(--theme-ink)" : "1px solid var(--theme-border-strong)",
  });

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "var(--theme-bg)", color: "var(--theme-ink)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md glass-pane-strong rounded-3xl p-8 lg:p-10"
      >
        <div className="mb-8 border-b pb-6" style={{ borderColor: "var(--theme-border)" }}>
          <h2 className="font-serif text-3xl font-black tracking-tight" style={{ color: "var(--theme-ink)" }}>
            Create your account.
          </h2>
          <p className="mt-2 font-serif text-sm" style={{ color: "var(--theme-ink-muted)" }}>
            Sign up as a {role.toLowerCase()} — it takes less than 2 minutes.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="mb-8 grid grid-cols-2 rounded-full p-1" style={{ border: "1px solid var(--theme-border-strong)" }}>
          {[ROLES.STUDENT, ROLES.OWNER].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => switchRole(r)}
              className="rounded-full px-4 py-2.5 font-serif text-xs font-bold uppercase tracking-[0.15em] transition-all"
              style={
                role === r
                  ? { background: "var(--theme-ink)", color: "var(--theme-bg)" }
                  : { color: "var(--theme-ink-muted)" }
              }
            >
              {r}
            </button>
          ))}
        </div>

        {/* Message */}
        <AnimatePresence>
          {submitMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="rounded-2xl overflow-hidden mb-6 px-4 py-3 text-center font-serif text-sm font-bold"
              style={
                submitMessage.type === "success"
                  ? { background: "var(--theme-ink)", color: "var(--theme-bg)" }
                  : { background: "var(--theme-surface-2)", color: "var(--theme-ink)", border: "1px solid var(--theme-border-strong)" }
              }
            >
              {submitMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Owner: Email + Password Form ── */}
        {role === ROLES.OWNER && (
          <motion.form
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit} noValidate className="space-y-5"
          >
            <motion.div variants={itemVariants}>
              <div>
                <label htmlFor="name" className="mb-2 block font-serif text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2" strokeWidth={1.5} style={{ color: errors.name ? "var(--theme-ink)" : "var(--theme-ink-faded)" }} />
                  <input id="name" type="text" placeholder="Rafsan Islam" value={name}
                    onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }}
                    className={inputClass("name")} style={inputStyle("name")} />
                </div>
                {errors.name && <p className="mt-1.5 font-serif text-xs" style={{ color: "var(--theme-ink)" }}>{errors.name}</p>}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div>
                <label htmlFor="email" className="mb-2 block font-serif text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2" strokeWidth={1.5} style={{ color: errors.email ? "var(--theme-ink)" : "var(--theme-ink-faded)" }} />
                  <input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
                    className={inputClass("email")} style={inputStyle("email")} />
                </div>
                {errors.email && <p className="mt-1.5 font-serif text-xs" style={{ color: "var(--theme-ink)" }}>{errors.email}</p>}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div>
                <label htmlFor="password" className="mb-2 block font-serif text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2" strokeWidth={1.5} style={{ color: errors.password ? "var(--theme-ink)" : "var(--theme-ink-faded)" }} />
                  <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
                    className={`${inputClass("password")} pr-10`} style={inputStyle("password")} />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--theme-ink-faded)" }} tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 font-serif text-xs" style={{ color: "var(--theme-ink)" }}>{errors.password}</p>}
                {password && !errors.password && strength && (
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-serif text-xs uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-faded)" }}>Password strength</span>
                      <span className="font-serif text-xs font-bold uppercase tracking-[0.1em]" style={{ color: strength.level === "weak" ? "var(--theme-ink-faded)" : "var(--theme-ink)" }}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)" }}>
                      <div className={`h-full transition-all duration-500 ${strength.width}`} style={{ background: strength.color }} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block font-serif text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2" strokeWidth={1.5} style={{ color: errors.confirmPassword ? "var(--theme-ink)" : "var(--theme-ink-faded)" }} />
                  <input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                    className={`${inputClass("confirmPassword")} pr-10`} style={inputStyle("confirmPassword")} />
                  <button type="button" onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--theme-ink-faded)" }} tabIndex={-1}>
                    {showConfirm ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 font-serif text-xs" style={{ color: "var(--theme-ink)" }}>{errors.confirmPassword}</p>}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div>
                <label className={`flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition-colors`}
                  style={{
                    background: errors.agreed ? "var(--theme-surface-2)" : "var(--theme-surface)",
                    border: errors.agreed ? "1px solid var(--theme-ink)" : "1px solid var(--theme-border)",
                  }}
                >
                  <input type="checkbox" checked={agreed}
                    onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((p) => ({ ...p, agreed: "" })); }}
                    className="mt-0.5 accent-current" style={{ color: "var(--theme-ink)" }} />
                  <span className="font-serif text-xs leading-relaxed" style={{ color: "var(--theme-ink-muted)" }}>
                    I agree to the{" "}
                    <a href="#" className="font-bold underline underline-offset-4" style={{ color: "var(--theme-ink)" }} onClick={(e) => e.preventDefault()}>
                      Terms of Service
                    </a>{" "}and{" "}
                    <a href="#" className="font-bold underline underline-offset-4" style={{ color: "var(--theme-ink)" }} onClick={(e) => e.preventDefault()}>
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreed && <p className="mt-1.5 font-serif text-xs" style={{ color: "var(--theme-ink)" }}>{errors.agreed}</p>}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button type="submit" disabled={isSubmitting}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full justify-center rounded-full py-3 font-serif text-xs font-bold uppercase tracking-[0.15em] disabled:opacity-50"
                style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}>
                {isSubmitting ? "Creating account..." : `Create ${role} Account`}
              </motion.button>
            </motion.div>
          </motion.form>
        )}

        {/* ── Student: Google Sign-In Only ── */}
        {role === ROLES.STUDENT && (
          <>
            <motion.div variants={itemVariants} className="mb-6">
              <div className="glass-pane rounded-2xl p-4 text-center">
                <p className="font-serif text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-muted)" }}>
                  Sign up with your institutional (.edu) email
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex justify-center">
                <div id="google-signup-btn" ref={googleBtnRef} />
              </div>
            </motion.div>
          </>
        )}

        <motion.div variants={itemVariants} className="mt-8">
          <p className="text-center font-serif text-sm" style={{ color: "var(--theme-ink-muted)" }}>
            Already have an account?{" "}
            <Link to="/auth" className="font-bold underline underline-offset-4 transition-all" style={{ color: "var(--theme-ink)" }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default SignUpPage;
