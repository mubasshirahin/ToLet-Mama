import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Sparkles,
  Phone,
  SwitchCamera,
  User,
  AlertCircle,
} from "lucide-react";
import { fetchProfile, updateProfile, updatePassword } from "../lib/api";

const ProfilePage = function ProfilePage() {
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Role comes from backend /profile or /auth/me - single source of truth
  const [role, setRole] = useState("Student");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const [fetchError, setFetchError] = useState("");

  // Fetch real profile from backend on mount
  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((data) => {
        if (cancelled) return;
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          city: data.city || "",
          bio: data.bio || "",
        }));
        setAvatarPreview(data.avatar || "");
        const backendRole = data.role ? (data.role === 'owner' ? 'Owner' : 'Student') : 'Student';
        setRole(backendRole);
        // Sync real backend data back to localStorage
        try {
          localStorage.setItem("toletmama.api_user", JSON.stringify(data));
          localStorage.setItem("toletmama.profile.currentRole", backendRole);
        } catch { /* ignore */ }
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFetchError("Could not load profile. Please log in again.");
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const avatarFallback = useMemo(() => {
    const initials = formData.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

    return initials || "TL";
  }, [formData.name]);

  const pushToast = (type, text) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, type, text }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (formData.phone.trim() && formData.phone.trim().length < 8) {
      nextErrors.phone = "Phone number looks too short.";
    }

    const passwordFieldsFilled =
      formData.currentPassword || formData.newPassword || formData.confirmPassword;
    if (passwordFieldsFilled) {
      if (!formData.currentPassword) {
        nextErrors.currentPassword = "Current password is required.";
      }
      if (!formData.newPassword) {
        nextErrors.newPassword = "New password is required.";
      } else if (formData.newPassword.length < 6) {
        nextErrors.newPassword = "Password must be at least 6 characters.";
      }
      if (!formData.confirmPassword) {
        nextErrors.confirmPassword = "Please confirm the new password.";
      } else if (formData.newPassword !== formData.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      pushToast("error", "Please choose an image file.");
      return;
    }

    // Convert to base64 for upload
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = String(reader.result);
      setAvatarPreview(base64);
      setUploadName(file.name);

      try {
        await updateProfile({ avatar: base64 });
        pushToast("success", "Avatar updated.");
      } catch {
        pushToast("error", "Could not save avatar.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validate()) {
      pushToast("error", "Please fix the highlighted fields.");
      return;
    }

    setIsSaving(true);
    try {
      // Update profile info
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        city: formData.city.trim() || null,
        bio: formData.bio.trim() || null,
        ...(avatarPreview ? { avatar: avatarPreview } : {}),
      });

      // Change password if filled
      if (formData.currentPassword || formData.newPassword) {
        await updatePassword({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        });
      }

      setFormData((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      pushToast("success", "Profile changes saved.");
    } catch (err) {
      const msg = err.response?.data?.message || "We could not save the profile right now.";
      pushToast("error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBioSave = async () => {
    setIsSavingBio(true);
    try {
      await updateProfile({ bio: formData.bio.trim() || null });
      pushToast("success", "Bio saved.");
    } catch {
      pushToast("error", "We could not save the bio right now.");
    } finally {
      setIsSavingBio(false);
    }
  };

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#FAF3E0] text-[#2C1810]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,58,33,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(44,24,16,0.08),transparent_24%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4">
          <div className="glass-pane rounded-3xl p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#2C1810]" strokeWidth={1.5} />
            <h2 className="font-serif text-xl font-black text-[#2C1810]">Something went wrong</h2>
            <p className="mt-2 font-serif text-sm text-[#5C3A21]">{fetchError}</p>
            <button
              onClick={() => { localStorage.removeItem("toletmama.api_token"); localStorage.removeItem("toletmama.api_user"); window.location.href = "/auth"; }}
              className="btn-rubber-stamp mt-6 px-6 py-3 text-sm"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF3E0] text-[#2C1810]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,58,33,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(44,24,16,0.08),transparent_24%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-4">
            <div className="h-3 w-32 bg-[#5C3A21]/10" />
            <div className="mt-4 h-9 w-2/3 bg-[#5C3A21]/10" />
            <div className="mt-3 h-4 w-1/2 bg-[#5C3A21]/10" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-5">
              <div className="h-6 w-48 bg-[#5C3A21]/10" />
              <div className="mt-6 h-40 w-40 bg-[#5C3A21]/10" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="h-10 bg-[#5C3A21]/10" />
                <div className="h-10 bg-[#5C3A21]/10" />
              </div>
            </div>
            <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-5">
              <div className="h-6 w-40 bg-[#5C3A21]/10" />
              <div className="mt-6 space-y-3">
                <div className="h-8 bg-[#5C3A21]/10" />
                <div className="h-8 bg-[#5C3A21]/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF3E0] text-[#2C1810]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,58,33,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(44,24,16,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.5),transparent_18%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex flex-col gap-4 glass-pane rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Link
              to="/dashboard"
              state={{ role }}
              className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A89880] transition-colors hover:text-[#2C1810]"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Back to dashboard
            </Link>
            <h1 className="font-serif text-3xl font-black tracking-tight text-[#2C1810] sm:text-4xl">
              User Profile
            </h1>
            <p className="mt-1 max-w-2xl font-serif text-sm text-[#5C3A21]">
              Update your personal details, upload a new photo, and manage your account from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border-2 border-[#2C1810] bg-[#FAF3E0] px-3 py-2 font-serif text-xs font-bold uppercase tracking-[0.15em]">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              {role} account
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-coupon-clip px-4 py-2 text-xs"
            >
              <Camera className="h-4 w-4" strokeWidth={1.8} />
              Upload avatar
            </button>
          </div>
        </motion.header>

        <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="space-y-6"
          >
            <div className="glass-pane rounded-2xl p-5 sm:p-6"
              >
              <div className="mb-5 flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--theme-border)" }}>
                <div>
                  <h2 className="font-serif text-xl font-black tracking-tight text-[#2C1810]">
                    Profile Details
                  </h2>
                  <p className="font-serif text-sm text-[#5C3A21]">
                    Edit your public identity and contact information.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                <div className="flex flex-col items-center gap-4">
                  <div className="halftone-overlay relative h-40 w-40 overflow-hidden border-2 border-[#2C1810] bg-[#F4E8C1] shadow-[6px_6px_0px_rgba(44,24,16,0.08)]">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-serif text-5xl font-black text-[#2C1810]">
                        {avatarFallback}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C1810]/80 to-transparent px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.15em] text-[#FAF3E0]">
                      Preview
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 font-serif text-xs font-bold uppercase tracking-[0.14em] text-[#5C3A21] transition-colors hover:text-[#2C1810]"
                  >
                    <SwitchCamera className="h-4 w-4" strokeWidth={1.8} />
                    Change photo
                  </button>

                  <p className="max-w-[180px] text-center font-serif text-[11px] leading-relaxed text-[#A89880]">
                    {uploadName || "PNG, JPG, or WEBP up to a few MB works best."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    icon={User}
                    value={formData.name}
                    onChange={(value) => handleChange("name", value)}
                    error={errors.name}
                    placeholder="Your full name"
                  />
                  <Field
                    label="Email Address"
                    icon={Mail}
                    value={formData.email}
                    onChange={(value) => handleChange("email", value)}
                    error={errors.email}
                    placeholder="you@example.com"
                    type="email"
                    disabled
                  />
                  <Field
                    label="Phone Number"
                    icon={Phone}
                    value={formData.phone}
                    onChange={(value) => handleChange("phone", value)}
                    error={errors.phone}
                    placeholder="+880 1..."
                  />
                  <Field
                    label="City"
                    icon={MapPin}
                    value={formData.city}
                    onChange={(value) => handleChange("city", value)}
                    placeholder="Dhaka"
                  />
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      rows={4}
                      placeholder="Tell others about yourself..."
                      className="vintage-inset w-full border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none transition-colors focus:border-[#2C1810]"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleBioSave}
                        disabled={isSavingBio}
                        className="btn-coupon-clip px-4 py-2 text-xs disabled:opacity-50"
                      >
                        {isSavingBio ? "Saving bio..." : "Save bio"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-pane rounded-2xl p-5 sm:p-6"
              >
              <div className="mb-5 border-b pb-4" style={{ borderColor: "var(--theme-border)" }}>
                <h2 className="font-serif text-xl font-black tracking-tight text-[#2C1810]">
                  Security
                </h2>
                <p className="font-serif text-sm text-[#5C3A21]">
                  Update your password only when you are ready to change it.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField
                  label="Current Password"
                  value={formData.currentPassword}
                  onChange={(value) => handleChange("currentPassword", value)}
                  error={errors.currentPassword}
                  visible={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword((current) => !current)}
                />
                <PasswordField
                  label="New Password"
                  value={formData.newPassword}
                  onChange={(value) => handleChange("newPassword", value)}
                  error={errors.newPassword}
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((current) => !current)}
                />
                <PasswordField
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(value) => handleChange("confirmPassword", value)}
                  error={errors.confirmPassword}
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((current) => !current)}
                  className="sm:col-span-2"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 glass-pane rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-serif text-xl font-black tracking-tight text-[#2C1810]">
                  Save Changes
                </h2>
                <p className="font-serif text-sm text-[#5C3A21]">
                  We&apos;ll keep the page open and confirm once your updates are applied.
                </p>
              </div>
              <motion.button
                type="submit"
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-rubber-stamp justify-center px-6 py-3 text-sm disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save profile"}
              </motion.button>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="space-y-6"
          >
            <div className="glass-pane rounded-2xl p-5 sm:p-6"
            >
              <div className="mb-5 border-b pb-4" style={{ borderColor: "var(--theme-border)" }}>
                <h2 className="font-serif text-xl font-black tracking-tight text-[#2C1810]">
                  Profile Summary
                </h2>
                <p className="font-serif text-sm text-[#5C3A21]">
                  Your current account context and info status.
                </p>
              </div>

              <div className="space-y-3 font-serif text-sm text-[#5C3A21]">
                <div className="flex items-center justify-between border-b border-[#5C3A21]/10 pb-2">
                  <span className="text-xs uppercase tracking-wide text-[#A89880]">
                    Active role
                  </span>
                  <span className="font-bold text-[#2C1810]">{role}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#5C3A21]/10 pb-2">
                  <span className="text-xs uppercase tracking-wide text-[#A89880]">
                    Name
                  </span>
                  <span className="font-bold text-[#2C1810]">{formData.name || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#5C3A21]/10 pb-2">
                  <span className="text-xs uppercase tracking-wide text-[#A89880]">
                    Email
                  </span>
                  <span className="font-bold text-[#2C1810]">{formData.email || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#5C3A21]/10 pb-2">
                  <span className="text-xs uppercase tracking-wide text-[#A89880]">
                    City
                  </span>
                  <span className="font-bold text-[#2C1810]">{formData.city || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-[#A89880]">
                    Avatar status
                  </span>
                  <span className="font-bold text-[#2C1810]">
                    {uploadName ? "Updated" : avatarPreview ? "From Google" : "Default"}
                  </span>
                </div>
              </div>
            </div>

          </motion.aside>
        </form>
      </div>

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto flex max-w-sm items-start gap-3 border-2 px-4 py-3 shadow-[4px_4px_0px_rgba(44,24,16,0.08)] ${
                toast.type === "success"
                  ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                  : "border-[#2C1810] bg-[#FAF3E0] text-[#2C1810]"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              )}
              <p className="font-serif text-sm font-bold">{toast.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, error, placeholder, type = "text", className = "", disabled = false }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
        {label}
      </label>
      <div className="relative">
        <Icon className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border-b-2 bg-transparent py-3 pl-7 font-serif text-sm text-[#2C1810] placeholder-[#A89880] outline-none transition-colors ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          } ${
            error ? "border-[#2C1810]" : "border-[#5C3A21]/30 focus:border-[#2C1810]"
          }`}
        />
      </div>
      {error && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{error}</p>}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  error,
  visible,
  onToggle,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5C3A21]">
        {label}
      </label>
      <div className="relative">
        <Lock className={`absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? "text-[#2C1810]" : "text-[#A89880]"}`} strokeWidth={1.5} />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter password"
          className={`w-full border-b-2 bg-transparent py-3 pl-7 pr-10 font-serif text-sm text-[#2C1810] placeholder-[#A89880] outline-none transition-colors ${
            error ? "border-[#2C1810]" : "border-[#5C3A21]/30 focus:border-[#2C1810]"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A89880] transition-colors hover:text-[#2C1810]"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
        </button>
      </div>
      {error && <p className="mt-1.5 font-serif text-xs text-[#2C1810]">{error}</p>}
    </div>
  );
}

export default ProfilePage;
