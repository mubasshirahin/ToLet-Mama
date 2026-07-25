import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, LockKeyhole, CheckCircle2 } from "lucide-react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve, reject) =>
        setTimeout(() => (Math.random() > 0.1 ? resolve() : reject(new Error("Network error"))), 1500)
      );
      setIsSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen items-center justify-center bg-[#FAF3E0] px-4 py-12 text-[#2C1810]"
    >
      {/* ─── Centered Form Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="w-full max-w-md bg-white border-2 border-[#5C3A21]/20 p-8 lg:p-10"
      >
        <div className="mb-10 flex items-center gap-3">
          <span className="font-serif text-xl font-black uppercase tracking-tight text-[#2C1810]">
            The Daily Gazette
          </span>
        </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isSent ? "sent" : "form"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
          {!isSent ? (
            <>
              <div className="mb-8 border-b-2 border-[#2C1810] pb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-[#5C3A21]/30 bg-[#FAF3E0]"
                >
                  <LockKeyhole className="h-6 w-6 text-[#2C1810]" strokeWidth={1} />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="font-serif text-3xl font-black tracking-tight text-[#2C1810]"
                >
                  Forgot your password?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="mt-2 font-serif text-sm text-[#5C3A21]"
                >
                  No worries — enter your email below and we&apos;ll send you a reset link.
                </motion.p>
              </div>

              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
                onSubmit={handleSubmit} noValidate className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <label htmlFor="email" className="mb-2 block font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
                    <input
                      id="email" type="email" placeholder="you@example.com" value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className={`w-full border-b-2 bg-transparent py-3 pl-7 font-serif text-sm text-[#2C1810] placeholder-[#A89880] outline-none transition-colors ${
                        error ? "border-[#2C1810]" : "border-[#5C3A21]/30 focus:border-[#2C1810]"
                      }`}
                    />
                  </div>
                  {error && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{error}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <motion.button type="submit" disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="btn-rubber-stamp w-full justify-center py-3 text-sm disabled:opacity-50">
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </motion.button>
                </motion.div>
              </motion.form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-[#2C1810] bg-[#FAF3E0]"
              >
                <CheckCircle2 className="h-8 w-8 text-[#2C1810]" strokeWidth={1} />
              </motion.div>
              <h2 className="mb-2 font-serif text-2xl font-black tracking-tight text-[#2C1810]">
                Check your email.
              </h2>
              <p className="mb-6 font-serif text-sm leading-relaxed text-[#5C3A21]">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-bold text-[#2C1810]">{email}</span>
              </p>
              <div className="mb-8 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] p-4">
                <p className="mb-2 font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-[#2C1810]">
                  Didn&apos;t receive the email?
                </p>
                <ul className="space-y-1.5 font-serif text-xs text-[#5C3A21]">
                  <li>— Check your spam or junk folder</li>
                  <li>— Make sure you entered the correct email</li>
                  <li>
                    —{" "}
                    <motion.button type="button" whileHover={{ x: 3 }}
                      onClick={() => { setIsSent(false); setError(""); }}
                      className="font-bold text-[#2C1810] underline underline-offset-4 decoration-[#5C3A21]/40 hover:decoration-[#2C1810]">
                      Try a different email
                    </motion.button>
                  </li>
                </ul>
              </div>
              <motion.button type="button"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setIsSent(false); setEmail(""); setError(""); }}
                className="btn-rubber-stamp w-full justify-center py-3 text-sm">
                Send Again
              </motion.button>
            </motion.div>
          )}
          </motion.div>
          </AnimatePresence>

          {/* Back to sign in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 border-t-2 border-[#5C3A21]/20 pt-6"
          >
            <Link to="/auth" className="inline-flex items-center gap-2 font-serif text-sm font-bold text-[#5C3A21] transition-colors hover:text-[#2C1810]">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Back to sign in
            </Link>
          </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ForgotPasswordPage;
