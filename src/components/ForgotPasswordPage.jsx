import { useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Mail, ArrowLeft, LockKeyhole, CheckCircle2 } from "lucide-react";

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
              No worries,{" "}
              <span className="italic text-[#CC0000]">we&apos;ve got you</span>
            </h1>
            <p className="font-body leading-relaxed text-[#A3A3A3]">
              Enter your email and we&apos;ll send you a link to reset your password.
              It happens to the best of us.
            </p>
          </div>
          <div className="flex items-center gap-3 border border-[#F9F9F7]/20 p-4">
            <LockKeyhole className="h-4 w-4 flex-shrink-0 text-[#A3A3A3]" strokeWidth={1.5} />
            <p className="font-sans text-xs text-[#A3A3A3]">
              Check your spam folder if you don&apos;t see the email within a few minutes.
            </p>
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

          {!isSent ? (
            <>
              <div className="mb-8 border-b border-[#111111] pb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center border border-[#111111]">
                  <LockKeyhole className="h-6 w-6 text-[#111111]" strokeWidth={1} />
                </div>
                <h2 className="font-serif text-3xl font-black tracking-tight text-[#111111]">
                  Forgot your password?
                </h2>
                <p className="mt-2 font-sans text-sm text-[#737373]">
                  No worries — enter your email below and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div>
                  <label htmlFor="email" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-widest text-[#111111]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? "text-[#CC0000]" : "text-[#A3A3A3]"}`} strokeWidth={1.5} />
                    <input
                      id="email" type="email" placeholder="you@example.com" value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className={`w-full border-b-2 bg-transparent py-3 pl-7 font-mono text-sm text-[#111111] placeholder-[#A3A3A3] outline-none transition-colors focus-visible:bg-[#F0F0F0] ${
                        error ? "border-[#CC0000]" : "border-[#111111]"
                      }`}
                    />
                  </div>
                  {error && <p className="mt-1.5 font-sans text-xs text-[#CC0000]">{error}</p>}
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="flex w-full items-center justify-center bg-[#111111] py-3 font-sans text-sm font-semibold uppercase tracking-widest text-[#F9F9F7] transition-all hover:bg-[#F9F9F7] hover:text-[#111111] hover:outline hover:outline-1 hover:outline-[#111111] disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[#111111]">
                <CheckCircle2 className="h-8 w-8 text-[#111111]" strokeWidth={1} />
              </div>
              <h2 className="mb-2 font-serif text-2xl font-black tracking-tight text-[#111111]">
                Check your email.
              </h2>
              <p className="mb-6 font-sans text-sm leading-relaxed text-[#525252]">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-semibold text-[#111111]">{email}</span>
              </p>
              <div className="mb-8 border border-[#111111] p-4">
                <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-[#111111]">
                  Didn&apos;t receive the email?
                </p>
                <ul className="space-y-1.5 font-sans text-xs text-[#525252]">
                  <li>— Check your spam or junk folder</li>
                  <li>— Make sure you entered the correct email</li>
                  <li>
                    —{" "}
                    <button type="button" onClick={() => { setIsSent(false); setError(""); }}
                      className="font-semibold text-[#111111] decoration-2 underline-offset-4 hover:text-[#CC0000] hover:underline hover:decoration-[#CC0000]">
                      Try a different email
                    </button>
                  </li>
                </ul>
              </div>
              <button type="button"
                onClick={() => { setIsSent(false); setEmail(""); setError(""); }}
                className="w-full border border-[#111111] bg-[#111111] py-3 font-sans text-sm font-semibold uppercase tracking-widest text-[#F9F9F7] transition-all hover:bg-[#F9F9F7] hover:text-[#111111] focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">
                Send Again
              </button>
            </div>
          )}

          {/* Back to sign in */}
          <div className="mt-8 border-t border-[#111111] pt-6">
            <Link to="/auth" className="inline-flex items-center gap-2 font-sans text-sm font-medium text-[#111111] decoration-2 underline-offset-4 transition-all hover:text-[#CC0000] hover:underline hover:decoration-[#CC0000]">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
