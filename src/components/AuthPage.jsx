import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
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
  const googleBtnRef = useRef(null);

  const validate = () => {
    const newErrors = {};
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await loginUser({ email, password });
      setSubmitMessage({ type: "success", text: `Welcome back, ${role}! Redirecting to your dashboard...` });
      setTimeout(() => navigate("/dashboard", { state: { role } }), 800);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
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
        await loginWithGoogle(user.credential);
        const firstName = user.name?.split(" ")[0] || role;
        setSubmitMessage({ type: "success", text: `Welcome back, ${firstName}! Redirecting to your dashboard...` });
        setTimeout(() => navigate("/dashboard", { state: { role } }), 800);
      } catch (err) {
        const msg = err.response?.data?.message || "Google sign-in failed. Please try again.";
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
    initGoogleSignIn("google-signin-btn", handleGoogleSignIn, role);
  }, [role]);

  const switchRole = (newRole) => {
    setRole(newRole);
    setErrors({});
    setSubmitMessage(null);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white border-2 border-[#5C3A21]/20 p-8 lg:p-10"
      >
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A89880] transition-colors hover:text-[#2C1810]"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to home
        </Link>

        <div className="mb-8 border-b-2 border-[#2C1810] pb-6">
          <h2 className="font-serif text-3xl font-black tracking-tight text-[#2C1810]">
            Welcome back.
          </h2>
          <p className="mt-2 font-serif text-sm text-[#5C3A21]">
            Sign in to your {role.toLowerCase()} account to continue.
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

        {/* Message */}
        <AnimatePresence>
          {submitMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className={`border-2 px-4 py-3 text-center font-serif text-sm font-bold overflow-hidden mb-6 ${
                submitMessage.type === "success"
                  ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                  : "border-[#2C1810] bg-[#FAF3E0] text-[#2C1810]"
              }`}
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
            onSubmit={handleSubmit} noValidate className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.email ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
                    className={`w-full border-b-2 bg-transparent py-3 pl-7 font-serif text-sm text-[#2C1810] placeholder-[#A89880] outline-none transition-colors ${
                      errors.email ? "border-[#2C1810]" : "border-[#5C3A21]/30 focus:border-[#2C1810]"
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.email}</p>}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.password ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
                    className={`w-full border-b-2 bg-transparent py-3 pl-7 pr-10 font-serif text-sm text-[#2C1810] placeholder-[#A89880] outline-none transition-colors ${
                      errors.password ? "border-[#2C1810]" : "border-[#5C3A21]/30 focus:border-[#2C1810]"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A89880] transition-colors hover:text-[#2C1810]" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{errors.password}</p>}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="font-serif text-xs font-bold uppercase tracking-[0.12em] text-[#5C3A21] transition-colors hover:text-[#2C1810] hover:underline hover:underline-offset-4 hover:decoration-[#2C1810]">
                  Forgot password?
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-rubber-stamp w-full justify-center py-3 text-sm disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : `Sign in as ${role}`}
              </motion.button>
            </motion.div>
          </motion.form>
        )}

        {/* ── Student: Google Sign-In Only ── */}
        {role === ROLES.STUDENT && (
          <>
            <motion.div variants={itemVariants} className="mb-6">
              <div className="rounded-sm border-2 border-[#5C3A21]/20 bg-[#FAF3E0] p-4 text-center">
                <p className="font-serif text-xs font-bold uppercase tracking-[0.15em] text-[#5C3A21]">
                  Sign in with your institutional (.edu) email
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex justify-center">
                <div id="google-signin-btn" ref={googleBtnRef} />
              </div>
            </motion.div>
          </>
        )}

        <motion.div variants={itemVariants} className="mt-8">
          <p className="text-center font-serif text-sm text-[#5C3A21]">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-bold text-[#2C1810] underline underline-offset-4 decoration-[#5C3A21]/40 hover:decoration-[#2C1810] transition-all">
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default AuthPage;
